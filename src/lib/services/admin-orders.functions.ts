import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin.functions";

/**
 * Lista pedidos com filtros avançados para o painel administrativo.
 */
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        status: z.string().optional(),
        nickname: z.string().optional(),
        email: z.string().optional(),
        externalReference: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    let query = supabase
      .from("orders")
      .select(`
        *,
        profile:profiles(email),
        items:order_items(
          id,
          product_name,
          unit_price,
          quantity
        ),
        payments:payments(
          id,
          provider,
          provider_payment_id,
          status,
          amount
        )
      `, { count: "exact" });

    if (data.status) query = query.eq("status", data.status);
    if (data.nickname) query = query.ilike("minecraft_nickname", `%${data.nickname}%`);
    if (data.email) query = query.ilike("profiles.email", `%${data.email}%`);
    if (data.externalReference) query = query.eq("id", data.externalReference);

    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw error;
    return { items: rows ?? [], count: count ?? 0 };
  });

/**
 * Obtém detalhes completos de um pedido para a visualização administrativa.
 */
export const adminGetOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        profile:profiles(*),
        items:order_items(
          *,
          delivery_queue(*)
        ),
        payments:payments(*),
        audit_logs:audit_logs(
          *,
          actor:profiles(email)
        )
      `)
      .eq("id", data.id)
      .single();

    if (error) throw error;
    return order;
  });

/**
 * Lista pagamentos para reconciliação financeira.
 */
export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        status: z.string().optional(),
        provider: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    let query = supabase
      .from("payments")
      .select(`
        *,
        order:orders(
          id,
          minecraft_nickname,
          status
        )
      `, { count: "exact" });

    if (data.status) query = query.eq("status", data.status);
    if (data.provider) query = query.eq("provider", data.provider);

    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw error;
    return { items: rows ?? [], count: count ?? 0 };
  });
