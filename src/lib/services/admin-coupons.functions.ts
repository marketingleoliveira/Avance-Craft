import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdmin } from "./admin.functions";
import { logAudit } from "./admin-content.functions";

export const adminListCoupons = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const adminCreateCoupon = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        code: z.string().min(3).max(20).transform(s => s.toUpperCase()),
        description: z.string().optional(),
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
    await assertAdmin(context.supabase, context.userId);
    
    const { data: coupon, error } = await context.supabase
      .from("coupons")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    await logAudit(context.supabase, context.userId, {
      action: "create",
      entity: "coupon",
      entity_id: coupon.id,
      metadata: data
    });

    return coupon;
  });

export const adminToggleCoupon = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    const { error } = await context.supabase
      .from("coupons")
      .update({ active: data.active })
      .eq("id", data.id);

    if (error) throw error;

    await logAudit(context.supabase, context.userId, {
      action: data.active ? "activate" : "deactivate",
      entity: "coupon",
      entity_id: data.id
    });

    return { success: true };
  });

export const validateCouponPublic = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ code: z.string(), subtotalCents: z.number() }).parse(data))
  .handler(async ({ data, context }) => {
    if (!context.userId) throw new Error("Não autenticado");
    
    const { validateCouponServer } = await import("./coupon-validation.server");
    return validateCouponServer(data.code, data.subtotalCents, context.userId, context.supabase);
  });
