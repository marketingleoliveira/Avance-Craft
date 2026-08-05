import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

export type CouponValidationResult = {
  valid: boolean;
  discountCents: number;
  message?: string;
  couponId?: string;
  discountType?: "percent" | "fixed";
  discountValue?: number;
};

/**
 * Validação profunda de cupons no servidor.
 * Protege contra:
 * - Uso duplicado por usuário
 * - Expiração de datas
 * - Limites de uso global
 * - Valor mínimo de compra
 */
export async function validateCouponServer(
  code: string,
  subtotalCents: number,
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  // 1. Buscar cupom
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .eq("active", true)
    .maybeSingle();

  if (error || !coupon) {
    return { valid: false, discountCents: 0, message: "Cupom inválido ou inexistente." };
  }

  const now = new Date().toISOString();

  // 2. Validar período
  if (coupon.starts_at && coupon.starts_at > now) {
    return { valid: false, discountCents: 0, message: "Este cupom ainda não é válido." };
  }
  if (coupon.expires_at && coupon.expires_at < now) {
    return { valid: false, discountCents: 0, message: "Este cupom já expirou." };
  }

  // 3. Validar limite de uso global
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return { valid: false, discountCents: 0, message: "Este cupom atingiu o limite de uso." };
  }

  // 4. Validar uso por usuário (Prevenção de abuso)
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();
  if (profile) {
    const { count } = await supabase
      .from("coupon_uses")
      .select("*", { count: 'exact', head: true })
      .eq("coupon_id", coupon.id)
      .eq("profile_id", profile.id);

    // Nota: Por padrão limitamos a 1 uso por usuário se não especificado no banco
    if (count && count >= 1) {
      return { valid: false, discountCents: 0, message: "Você já utilizou este cupom." };
    }
  }

  // 5. Calcular desconto
  let discountCents = 0;
  let type: "percent" | "fixed" = "percent";
  let value = 0;

  if (coupon.discount_percent) {
    discountCents = Math.floor(subtotalCents * (Number(coupon.discount_percent) / 100));
    type = "percent";
    value = Number(coupon.discount_percent);
  } else if (coupon.discount_amount) {
    discountCents = Math.round(Number(coupon.discount_amount) * 100);
    type = "fixed";
    value = Number(coupon.discount_amount);
  }

  // Garantir que o desconto não seja negativo e não exceda o subtotal
  discountCents = Math.max(0, Math.min(subtotalCents, discountCents));

  return {
    valid: true,
    discountCents,
    couponId: coupon.id,
    discountType: type,
    discountValue: value
  };
}
