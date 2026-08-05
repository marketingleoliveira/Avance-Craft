import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin.functions";
import { logAudit } from "./admin-content.functions";

export const adminListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const adminCreateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        code: z.string().min(3).max(20).transform(s => s.toUpperCase()),
        description: z.string().optional().nullable(),
        discount_percent: z.number().min(0).max(100).optional().nullable(),
        discount_amount: z.number().min(0).optional().nullable(),
        max_uses: z.number().int().min(1).optional().nullable(),
        starts_at: z.string().optional().nullable(),
        expires_at: z.string().optional().nullable(),
        active: z.boolean().default(true),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);
    
    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({
        code: data.code,
        description: data.description ?? null,
        discount_percent: data.discount_percent ?? null,
        discount_amount: data.discount_amount ?? null,
        max_uses: data.max_uses ?? null,
        starts_at: data.starts_at ?? null,
        expires_at: data.expires_at ?? null,
        active: data.active,
      } as any)
      .select()
      .single();

    if (error) throw error;

    await logAudit(supabase, userId, "create", "coupon", coupon.id, data);

    return coupon;
  });

export const adminToggleCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);
    
    const { error } = await supabase
      .from("coupons")
      .update({ active: data.active })
      .eq("id", data.id);

    if (error) throw error;

    await logAudit(supabase, userId, data.active ? "activate" : "deactivate", "coupon", data.id);

    return { success: true };
  });

export const validateCouponPublic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ code: z.string(), subtotalCents: z.number() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    
    const { validateCouponServer } = await import("./coupon-validation.server");
    return validateCouponServer(data.code, data.subtotalCents, userId, supabase);
  });
