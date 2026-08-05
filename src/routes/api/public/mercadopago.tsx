import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createHmac } from "crypto";
import { logger } from "@/lib/config/logger.server";

export const Route = createFileRoute("/api/public/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const MP_ACCESS_TOKEN = process.env['MERCADOPAGO_ACCESS_TOKEN'];
        const WEBHOOK_SECRET = process.env['MERCADOPAGO_WEBHOOK_SECRET'];

        // 1. Receber Notificação e Headers
        const xSignature = request.headers.get("x-signature");
        const xRequestId = request.headers.get("x-request-id");
        const bodyText = await request.text();
        const body = JSON.parse(bodyText);

        let isSignatureValid = false;

        // 2. Validar Assinatura (Headers oficiais)
        if (WEBHOOK_SECRET && xSignature) {
          try {
            const parts = xSignature.split(",");
            const tsPart = parts.find(p => p.startsWith("t="));
            const hashPart = parts.find(p => p.startsWith("v1="));

            if (tsPart && hashPart) {
              const timestampStr = tsPart.split("=")[1];
              const signature = hashPart.split("=")[1];
              
              const now = Math.floor(Date.now() / 1000);
              const tsValue = parseInt(timestampStr || "0");
              
              if (!isNaN(tsValue) && Math.abs(now - tsValue) < 300) {
                const resourceId = body.data?.id || body.id;
                const manifest = `id:${resourceId};request-id:${xRequestId ?? ""};ts:${timestampStr};`;
                const hmac = createHmac("sha256", WEBHOOK_SECRET);
                hmac.update(manifest);
                const expectedSignature = hmac.digest("hex");
                
                if (signature === expectedSignature) {
                  isSignatureValid = true;
                }
              }
            }
          } catch (err) {
            await logger.error("mercadopago", "Signature validation error", err, { context: { xSignature, xRequestId } });
          }
        } else if (!process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development') {
          isSignatureValid = true;
          await logger.info("mercadopago", "Bypassing signature in development mode");
        }

        // 3. Registrar evento bruto sanitizado
        const { data: eventRow } = await supabaseAdmin.from("payment_events").insert({
          provider: "mercadopago",
          event_type: body.type || body.action || "unknown",
          external_event_id: (body.data?.id || body.id || xRequestId || "unknown").toString(),
          payload: body,
          signature_valid: isSignatureValid,
        }).select().single();

        if (!isSignatureValid && process.env['NODE_ENV'] === 'production') {
          await logger.critical("mercadopago", "Invalid signature in production", { 
            context: { xSignature, xRequestId, body } 
          });
          return new Response("Invalid signature", { status: 401 });
        }

        // 4. Processar apenas eventos de pagamento
        const isPaymentEvent = body.type === "payment" || body.action === "payment.created" || body.action === "payment.updated";
        const resourceId = body.data?.id || body.id;

        if (isPaymentEvent && resourceId && MP_ACCESS_TOKEN) {
          try {
            // 5. Consultar pagamento na API do MP
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
              headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
            });

            if (!mpResponse.ok) throw new Error(`MP API error: ${mpResponse.status}`);
            const payment = await mpResponse.json();

            const orderId = payment.external_reference;
            if (!orderId) return new Response("No external_reference", { status: 200 });

            // 6. Idempotência e busca de pedido
            const { data: order, error: orderError } = await supabaseAdmin
              .from("orders")
              .select("*, items:order_items(*)")
              .eq("id", orderId)
              .single();

            if (orderError || !order) return new Response("Order not found", { status: 200 });

            // 7. Upsert Registro de Pagamento
            const { data: paymentRecord } = await supabaseAdmin
              .from("payments")
              .upsert({
                order_id: order.id,
                provider: "mercadopago",
                provider_payment_id: payment.id.toString(),
                amount: payment.transaction_amount,
                currency: payment.currency_id,
                status: payment.status as any,
                raw_payload: payment,
                method: payment.payment_method_id,
              }, { onConflict: 'provider_payment_id' })
              .select()
              .single();

            if (eventRow && paymentRecord) {
              await supabaseAdmin.from("payment_events").update({ payment_id: paymentRecord.id }).eq("id", eventRow.id);
            }

            // 8. Se aprovado, processar entrega
            if (payment.status === "approved" && order.status !== "paid") {
              if (Math.abs(payment.transaction_amount - order.total) > 0.01) {
                await logger.critical("mercadopago", "Amount mismatch", { 
                  orderId: order.id, 
                  context: { expected: order.total, actual: payment.transaction_amount } 
                });
                return new Response("Amount mismatch", { status: 200 });
              }

              await supabaseAdmin.from("orders").update({ 
                status: "paid", 
                paid_at: new Date().toISOString() 
              }).eq("id", order.id);

              for (const item of order.items) {
                const { data: commands } = await supabaseAdmin
                  .from("product_commands")
                  .select("*")
                  .eq("product_id", item.product_id as string);

                if (commands) {
                  const deliveryItems = commands.map(cmd => ({
                    order_item_id: item.id,
                    server_id: cmd.server_id,
                    command: cmd.command
                      .replace("{player}", order.minecraft_nickname)
                      .replace("{quantity}", item.quantity.toString()),
                    status: "queued" as const,
                    idempotency_key: `${order.id}-${item.id}-${cmd.id}`
                  }));
                  await supabaseAdmin.from("delivery_queue").upsert(deliveryItems, { onConflict: 'idempotency_key' });
                }
              }
            } else if (["rejected", "cancelled", "refunded"].includes(payment.status)) {
              await supabaseAdmin.from("orders").update({ status: payment.status as any }).eq("id", order.id);
            }
          } catch (err) {
            console.error("Webhook processing error:", err);
            return new Response("Internal Error", { status: 500 });
          }
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
