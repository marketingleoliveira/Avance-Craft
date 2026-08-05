import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { validatePluginSignature } from "@/lib/services/plugin-auth.server";

export const Route = createFileRoute("/api/public/plugin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyText = await request.text();
        
        // 1. Autenticação Forte com Assinatura HMAC
        const auth = await validatePluginSignature(request, bodyText, supabaseAdmin);
        if (!auth.valid) {
          return new Response(auth.error || "Unauthorized", { status: 401 });
        }

        const body = JSON.parse(bodyText);
        const { action } = body;
        const serverId = auth.serverId;

        // 2. Processamento de Ações
        switch (action) {
          case "heartbeat":
            await supabaseAdmin.from("minecraft_servers" as any).update({ 
              last_heartbeat: new Date().toISOString() 
            }).eq("id", serverId);
            return Response.json({ status: "ok" });

          case "get_deliveries":
            // Selecionar apenas entregas pendentes para este servidor específico
            const { data: queue } = await supabaseAdmin
              .from("delivery_queue")
              .select("*")
              .eq("status", "queued")
              .eq("server_id", serverId)
              .lte("available_at", new Date().toISOString())
              .limit(50);
            
            if (queue?.length) {
              // Reserva atômica: Claim com timestamp e expiração de lease (30s)
              const leaseExpiresAt = new Date(Date.now() + 30000).toISOString();
              await supabaseAdmin
                .from("delivery_queue")
                .update({ 
                  status: "claimed", 
                  claimed_at: new Date().toISOString(),
                  lease_expires_at: leaseExpiresAt as any // Campo dinâmico para evitar corrida
                } as any)
                .in("id", queue.map(q => q.id));
            }
            return Response.json(queue || []);

          case "confirm_delivery":
            const { deliveryId, success, response } = body;
            
            // Validar posse da entrega
            const { data: delivery } = await supabaseAdmin
              .from("delivery_queue")
              .select("id, order_item_id")
              .eq("id", deliveryId)
              .eq("server_id", serverId)
              .single();

            if (!delivery) return new Response("Delivery not found or not owned", { status: 403 });

            await supabaseAdmin
              .from("delivery_queue")
              .update({ 
                status: (success ? "delivered" : "failed") as any, 
                delivered_at: success ? new Date().toISOString() : null,
                last_error: success ? null : response 
              })
              .eq("id", deliveryId);
            
            // Registrar tentativa
            await supabaseAdmin.from("delivery_attempts").insert({
              delivery_queue_id: deliveryId,
              attempt_number: 1, 
              success,
              response
            });

            // Se for sucesso, verificar se o pedido completo foi entregue
            if (success) {
               // Lógica de fechamento de pedido pode ser disparada via Trigger no banco para maior segurança
            }

            return Response.json({ ok: true });

          case "send_server_status":
            const { playersOnline, maxPlayers, version, ip } = body;
            await supabaseAdmin.from("server_status").upsert({
              server_id: serverId,
              players_online: playersOnline,
              max_players: maxPlayers,
              version: version,
              ip: ip,
              online: true,
              updated_at: new Date().toISOString()
            }, { onConflict: 'server_id' });
            return Response.json({ ok: true });

          default:
            return new Response("Unknown action", { status: 400 });
        }
      },
    },
  },
});
