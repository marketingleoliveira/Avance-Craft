import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin.functions";
import { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

/**
 * Lista pedidos com filtros avançados.
 * Proteção: Validação Zod + assertAdmin.
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
        limit: z.number().int().min(1).max(50).default(50),
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

    if (data.status) query = query.eq("status", data.status as OrderStatus);
    if (data.nickname) query = query.ilike("minecraft_nickname", `%${data.nickname}%`);
    if (data.email) query = query.ilike("profiles.email", `%${data.email}%`);
    if (data.externalReference) query = query.eq("id", data.externalReference);

    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      console.error("[Audit] Error listing orders", error);
      throw new Error("Internal server error");
    }
    return { items: rows ?? [], count: count ?? 0 };
  });

/**
 * Obtém detalhes de um pedido.
 * Proteção: Mascara dados sensíveis e valida permissão.
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
        profile:profiles(id, username, avatar_url, created_at),
        items:order_items(
          *,
          delivery_queue(*)
        ),
        payments:payments(id, provider, status, amount, currency, created_at),
        audit_logs:audit_logs(
          id,
          action,
          entity,
          created_at,
          actor:profiles(username)
        )
      `)
      .eq("id", data.id)
      .single();

    if (error || !order) throw new Error("Pedido não encontrado.");
    return order;
  });

/**
 * Lista pagamentos.
 */
export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        status: z.string().optional(),
        provider: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(50),
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
        id,
        amount,
        currency,
        status,
        provider,
        provider_payment_id,
        created_at,
        order:orders(
          id,
          minecraft_nickname,
          status
        )
      `, { count: "exact" });

    if (data.status) query = query.eq("status", data.status as PaymentStatus);
    if (data.provider) query = query.eq("provider", data.provider);

    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      console.error("[Audit] Error listing payments", error);
      throw new Error("Internal server error");
    }
    return { items: rows ?? [], count: count ?? 0 };
  });
