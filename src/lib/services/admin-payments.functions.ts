import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isStaging, isDev } from "../config/env.server";

export const adminGetPaymentDetails = createServerFn({ method: "GET" })
  .input(z.object({ orderId: z.string().uuid() }))
  .handler(async ({ data }) => {
    // PROTEÇÃO: Somente staging ou dev
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
      order,
      // Sanitizar dados sensíveis para o painel de teste
      sanitized_env: {
        MP_ACCESS_TOKEN_PRESENT: !!process.env['MERCADOPAGO_ACCESS_TOKEN'],
        MP_WEBHOOK_SECRET_PRESENT: !!process.env['MERCADOPAGO_WEBHOOK_SECRET'],
        APP_URL: process.env['APP_BASE_URL']
      }
    };
  });

export const adminSimulateWebhook = createServerFn({ method: "POST" })
  .input(z.object({ 
    orderId: z.string().uuid(),
    status: z.enum(["approved", "pending", "rejected", "refunded"])
  }))
  .handler(async ({ data }) => {
    // PROTEÇÃO: Somente staging ou dev
    if (!isStaging() && !isDev()) {
      throw new Error("Este recurso está disponível apenas em ambiente de Staging.");
    }

    // Nota: Em uma integração real, chamaríamos o próprio webhook interno bypassando a assinatura
    // Mas para o harness, vamos simular o efeito no banco para testar a lógica de negócio
    
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("total")
      .eq("id", data.orderId)
      .single();

    if (!order) throw new Error("Pedido não encontrado.");

    const paymentId = crypto.randomUUID();

    // 1. Criar registro em payments
    const { error: pError } = await supabaseAdmin.from("payments").insert({
      order_id: data.orderId,
      provider_payment_id: `MOCK-${paymentId}`,
      provider_name: "mercadopago_mock",
      status: data.status,
      amount: order.total,
      currency: "BRL"
    });

    if (pError) throw new Error(`Falha ao registrar pagamento: ${pError.message}`);

    // 2. Criar evento
    await supabaseAdmin.from("payment_events").insert({
      order_id: data.orderId,
      event_type: "payment.updated",
      payload: { 
        action: "payment.created", 
        data: { id: `MOCK-${paymentId}` },
        simulated: true,
        status: data.status
      }
    });

    // 3. Se aprovado, atualizar pedido e enfileirar entrega
    if (data.status === "approved") {
      await supabaseAdmin.from("orders").update({ 
        status: "paid",
        paid_at: new Date().toISOString()
      }).eq("id", data.orderId);

      // Trigger delivery queue (exemplo simplificado)
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", data.orderId);

      if (items) {
        for (const item of items) {
          await supabaseAdmin.from("delivery_queue").insert({
            order_id: data.orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            status: "pending"
          });
        }
      }
    }

    return { success: true, paymentId: `MOCK-${paymentId}` };
  });
