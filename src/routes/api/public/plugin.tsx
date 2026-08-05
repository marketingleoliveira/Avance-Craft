import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { validatePluginSignature } from "@/lib/services/plugin-auth.server";
import { handleDeliverySuccess, handleDeliveryFailure } from "@/lib/services/delivery-processor.server";

export const Route = createFileRoute("/api/public/plugin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyText = await request.text();
        
        // 1. Autenticação Forte com Assinatura HMAC
        const auth = await validatePluginSignature(request, bodyText, supabaseAdmin);
        if (!auth.valid || !auth.serverId) {
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
              const leaseExpiresAt = new Date(Date.now() + 30000).toISOString();
              await supabaseAdmin
                .from("delivery_queue")
                .update({ 
                  status: "claimed", 
                  claimed_at: new Date().toISOString(),
                  lease_expires_at: leaseExpiresAt as any 
                } as any)
                .in("id", queue.map(q => q.id));
            }
            return Response.json(queue || []);

          case "confirm_delivery":
            const { deliveryId, success, response } = body;
            if (!deliveryId) return new Response("Missing deliveryId", { status: 400 });
            
            const { data: delivery } = await supabaseAdmin
              .from("delivery_queue")
              .select("id, order_item_id")
              .eq("id", deliveryId)
              .eq("server_id", serverId)
              .single();

            if (!delivery) return new Response("Delivery not found or not owned", { status: 403 });

            if (success) {
              await handleDeliverySuccess(deliveryId, response || "Success", supabaseAdmin);
            } else {
              await handleDeliveryFailure(deliveryId, response || "Failed", supabaseAdmin);
            }

            return Response.json({ ok: true });

          case "send_server_status":
            const { playersOnline, maxPlayers, version, ip } = body;
            await supabaseAdmin.from("server_status").upsert({
              server_id: serverId,
              players_online: Number(playersOnline) || 0,
              max_players: Number(maxPlayers) || 0,
              version: String(version || ""),
              ip: String(ip || ""),
              online: true,
              updated_at: new Date().toISOString()
            } as any, { onConflict: 'server_id' });
            return Response.json({ ok: true });

          default:
            return new Response("Unknown action", { status: 400 });
        }
      },
    },
  },
});
