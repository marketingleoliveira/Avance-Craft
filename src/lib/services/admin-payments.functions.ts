import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isStaging, isDev } from "../config/env.server";
import { Database } from "@/integrations/supabase/types";

export const adminGetPaymentDetails = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    if (!isStaging() && !isDev()) {
      throw new Error("Este recurso está disponível apenas em ambiente de Staging.");
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (*),
        payments (*),
        payment_events (*)
      `)
      .eq("id", data.orderId)
      .single();

    if (orderError) throw new Error(`Erro ao buscar pedido: ${orderError.message}`);

    return {
      order: order as any,
      sanitized_env: {
        MP_ACCESS_TOKEN_PRESENT: !!process.env['MERCADOPAGO_ACCESS_TOKEN'],
        MP_WEBHOOK_SECRET_PRESENT: !!process.env['MERCADOPAGO_WEBHOOK_SECRET'],
        APP_URL: process.env['APP_BASE_URL']
      }
    };
  });

export const adminSimulateWebhook = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ 
    orderId: z.string().uuid(),
    status: z.enum(["approved", "pending", "rejected", "refunded"])
  }).parse(data))
  .handler(async ({ data }) => {
    if (!isStaging() && !isDev()) {
      throw new Error("Este recurso está disponível apenas em ambiente de Staging.");
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("total, order_items(id, product_id, quantity)")
      .eq("id", data.orderId)
      .single();

    if (!order) throw new Error("Pedido não encontrado.");

    const paymentId = crypto.randomUUID();

    const { error: pError } = await supabaseAdmin.from("payments").insert({
      order_id: data.orderId,
      provider_payment_id: `MOCK-${paymentId}`,
      provider: "mercadopago",
      status: data.status as Database["public"]["Enums"]["payment_status"],
      amount: order.total,
      currency: "BRL"
    });

    if (pError) throw new Error(`Falha ao registrar pagamento: ${pError.message}`);

    await supabaseAdmin.from("payment_events").insert({
      order_id: data.orderId as any, // Bypass mapping mismatch in mock
      event_type: "payment.updated",
      payload: { 
        action: "payment.created", 
        data: { id: `MOCK-${paymentId}` },
        simulated: true,
        status: data.status
      } as any
    });

    if (data.status === "approved") {
      await supabaseAdmin.from("orders").update({ 
        status: "paid",
        paid_at: new Date().toISOString()
      }).eq("id", data.orderId);

      if (order.order_items) {
        for (const item of order.order_items) {
          await supabaseAdmin.from("delivery_queue").insert({
            order_item_id: item.id,
            command: "say Simulação de entrega staging", // Placeholder, o real viria do produto
            idempotency_key: `mock-deliv-${item.id}-${Date.now()}`,
            status: "queued"
          });
        }
      }
    }

    return { success: true, paymentId: `MOCK-${paymentId}` };
  });
