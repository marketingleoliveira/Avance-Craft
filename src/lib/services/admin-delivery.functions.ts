import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin.functions";
import { logAudit } from "./admin-content.functions";

/**
 * Lista itens da fila de entrega com filtros para administração.
 */
export const adminListDeliveryQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        status: z.string().optional(),
        orderId: z.string().uuid().optional(),
        nickname: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    let query = supabase
      .from("delivery_queue")
      .select(`
        *,
        order_item:order_items(
          product_name,
          order:orders(id, minecraft_nickname, status)
        )
      `, { count: "exact" });

    if (data.status) query = query.eq("status", data.status);
    if (data.orderId) query = query.eq("order_item.order_id", data.orderId);
    if (data.nickname) query = query.ilike("order_item.order.minecraft_nickname", `%${data.nickname}%`);

    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw error;
    return { items: rows ?? [], count: count ?? 0 };
  });

/**
 * Reprocessa uma entrega que falhou ou expirou.
 * Cria uma nova tentativa resetando o status para 'queued'.
 */
export const adminRetryDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    const { data: delivery, error: fetchError } = await supabase
      .from("delivery_queue")
      .select("status, attempts")
      .eq("id", data.id)
      .single();

    if (fetchError || !delivery) throw new Error("Entrega não encontrada.");
    if (delivery.status === "delivered") throw new Error("Não é possível reprocessar uma entrega concluída.");

    const { error: updateError } = await supabase
      .from("delivery_queue")
      .update({
        status: "queued",
        attempts: 0, // Resetar tentativas para nova chance
        available_at: new Date().toISOString(),
        claimed_at: null,
        last_error: "Reprocessado manualmente pelo administrador."
      } as any)
      .eq("id", data.id);

    if (updateError) throw updateError;

    await logAudit(supabase, userId, "retry_delivery", "delivery", data.id);

    return { success: true };
  });

/**
 * Cancela uma entrega na fila.
 */
export const adminCancelDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid(), reason: z.string().min(5) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    const { error } = await supabase
      .from("delivery_queue")
      .update({
        status: "cancelled",
        last_error: `Cancelado: ${data.reason}`
      } as any)
      .eq("id", data.id);

    if (error) throw error;

    await logAudit(supabase, userId, "cancel_delivery", "delivery", data.id, { reason: data.reason });

    return { success: true };
  });

/**
 * Busca tentativas de entrega para um item específico.
 */
export const adminGetDeliveryAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ deliveryId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    await assertAdmin(supabase, userId);

    const { data: attempts, error } = await supabase
      .from("delivery_attempts")
      .select("*")
      .eq("delivery_queue_id", data.deliveryId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return attempts ?? [];
  });
