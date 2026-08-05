import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

export async function createCheckoutRequest(
  data: {
    nickname: string;
    edition: "java" | "bedrock";
    items: { productId: string; quantity: number }[];
    couponCode?: string;
  },
  supabase: SupabaseClient<Database>,
  userId: string
) {
  // 1. Validar produtos e calcular valores reais do banco
  const productIds = data.items.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("active", true);

  if (!products || products.length === 0) {
    throw new Error("Nenhum produto válido encontrado.");
  }

  let subtotal = 0;
  const orderItems = data.items.map((item) => {
    const p = products.find((prod) => prod.id === item.productId);
    if (!p) throw new Error(`Produto ${item.productId} inválido.`);
    
    const price = p.promotional_price ?? p.price;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;

    return {
      product_id: p.id,
      product_name: p.name,
      unit_price: price,
      quantity: item.quantity,
      total: itemTotal,
    };
  });

  // 2. Validar cupom se houver
  let discount = 0;
  let couponId = null;
  if (data.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", data.couponCode.toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (coupon) {
      couponId = coupon.id;
      if (coupon.discount_percent) {
        discount = subtotal * (Number(coupon.discount_percent) / 100);
      } else if (coupon.discount_amount) {
        discount = Number(coupon.discount_amount);
      }
    }
  }

  const total = Math.max(0, subtotal - discount);
  const idempotencyKey = crypto.randomUUID();

  // 3. Criar o pedido (idempotente)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: (await supabase.from("profiles").select("id").eq("user_id", userId).single()).data?.id,
      minecraft_nickname: data.nickname,
      edition: data.edition,
      status: "pending",
      subtotal,
      discount,
      total,
      coupon_id: couponId,
      idempotency_key: idempotencyKey,
      payment_provider: "mercadopago"
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 4. Criar itens do pedido
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

  if (itemsError) throw itemsError;

  // 5. Mock de integração com Mercado Pago (Checkout Pro)
  // Em produção, aqui chamaríamos a API do Mercado Pago para gerar o init_point
  const mockCheckoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${order.id}`;

  return {
    orderId: order.id,
    checkoutUrl: mockCheckoutUrl,
  };
}
