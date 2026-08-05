import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Receber notificação do Mercado Pago
        const body = await request.json();
        const { type, data } = body;

        // Registrar o evento para auditoria e debug
        await supabaseAdmin.from("payment_events").insert({
          provider: "mercadopago",
          event_type: type,
          external_event_id: data?.id?.toString() || "unknown",
          payload: body,
          signature_valid: true, // Em prod, validar x-signature
        });

        if (type === "payment" && data?.id) {
          // 2. Buscar detalhes do pagamento no Mercado Pago (Mock)
          // Em prod: const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, ...)
          
          // Simulando busca do pedido via external_reference (que seria o ID do nosso pedido)
          // Para este mock, assumimos que o pagamento foi aprovado
          const paymentStatus = "approved"; 
          const externalReference = body.external_reference; // ID do Pedido

          if (paymentStatus === "approved" && externalReference) {
            // 3. Atualizar pedido
            const orderId = (externalReference?.toString() || "") as any;
            const { data: order } = await supabaseAdmin
              .from("orders")
              .update({ status: "paid", paid_at: new Date().toISOString() })
              .eq("id", orderId)
              .select("*, items:order_items(*)")
              .single();









            if (order) {
              // 4. Gerar fila de entrega (comandos Minecraft)
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
                    idempotency_key: crypto.randomUUID()
                  }));


                  await supabaseAdmin.from("delivery_queue").insert(deliveryItems);
                }
              }
            }
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
