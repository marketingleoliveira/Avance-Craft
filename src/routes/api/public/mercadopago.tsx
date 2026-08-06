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

            // 8. Se aprovado, processar entrega atômica
            try {
              if (payment.status === "approved" && order.status !== "paid") {
                if (Math.abs(payment.transaction_amount - order.total) > 0.01) {
                  await logger.critical("mercadopago", "Amount mismatch", { 
                    orderId: order.id, 
                    context: { expected: order.total, actual: payment.transaction_amount } 
                  });
                  return new Response("Amount mismatch", { status: 200 });
                }

                // Chamada para a RPC atômica que processa tudo no banco
                const { data: result, error: rpcError } = await supabaseAdmin.rpc("process_approved_payment", {
                  _payment_id: paymentRecord?.id,
                  _external_reference: payment.external_reference,
                  _metadata: { webhook_received_at: new Date().toISOString() }
                });

                if (rpcError) {
                  await logger.error("webhook-mercadopago", "RPC atomic process failed", { 
                    context: { error: rpcError, paymentId: paymentRecord?.id, orderId: order.id } 
                  });
                  return new Response("Internal Processing Error", { status: 500 });
                }

                const processResult = result as { success: boolean; error?: string; message?: string };
                
                if (!processResult.success) {
                  await logger.warn("webhook-mercadopago", "RPC returned failure", { 
                    context: { error: processResult.error, paymentId: paymentRecord?.id } 
                  });
                  return new Response(processResult.error || "failed", { status: 400 });
                }

                await logger.info("webhook-mercadopago", "Payment processed successfully via RPC", {
                  context: { paymentId: paymentRecord?.id, orderId: order.id, result: processResult }
                });

              } else if (["rejected", "cancelled", "refunded"].includes(payment.status)) {
                await supabaseAdmin.from("orders").update({ status: payment.status as any }).eq("id", order.id);
                if (paymentRecord) {
                  await supabaseAdmin.from("payments").update({ status: payment.status as any }).eq("id", paymentRecord.id);
                }
              }
            } catch (err) {
              await logger.error("webhook-mercadopago", "Critical error in webhook processing", {
                context: { error: (err as Error).message, paymentId: paymentRecord?.id }
              });
              return new Response("Internal Error", { status: 500 });
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
