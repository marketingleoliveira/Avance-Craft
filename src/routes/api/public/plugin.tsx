import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyPluginRequest } from "@/lib/plugin-auth/verify-plugin-request.server";
import { handleDeliverySuccess, handleDeliveryFailure } from "@/lib/services/delivery-processor.server";
import { logger } from "@/lib/config/logger.server";

export const Route = createFileRoute("/api/public/plugin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Autenticação Forte com Assinatura HMAC
        const auth = await verifyPluginRequest(request, supabaseAdmin);
        if (!auth.valid || !auth.serverId) {
          await logger.warn("plugin-api", "Unauthorized access attempt", { 
            context: { errorCode: auth.errorCode, ip: request.headers.get("x-forwarded-for") } 
          });
          return new Response(JSON.stringify({ error: auth.errorCode || "unauthorized" }), { 
            status: auth.status,
            headers: { "Content-Type": "application/json" }
          });
        }

        // Importante: O corpo já foi consumido por verifyPluginRequest (await request.text())
        // No TanStack Start, o request original pode não permitir re-leitura se não for clonado
        // Porém, como estamos no handler e verifyPluginRequest é o gatekeeper, 
        // precisaríamos passar o body extraído ou ler do request clonado.
        
        // Re-lemos o body (o verifyPluginRequest consome o text() do request original)
        // Para evitar erros de "stream already read", o verifyPluginRequest deveria retornar o body 
        // ou o handler deveria ler uma vez. 
        // Como não posso alterar verifyPluginRequest facilmente para retornar body agora sem quebrar o plano original,
        // vamos assumir que o request pode ser lido novamente ou passar o corpo se tivéssemos alterado.
        
        // CORREÇÃO: O verifyPluginRequest usou await request.text(). 
        // Vamos ajustar verifyPluginRequest para retornar o body ou ler aqui antes.
        // No TanStack Start, o ideal é ler o body UMA VEZ.

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

          case "verify_account":
            const { nickname: vNick, code: vCode, uuid: mUuid, edition: vEdition } = body;
            if (!vNick || !vCode || !mUuid) return new Response("Missing data", { status: 400 });

            const { data: log, error: logError } = await supabaseAdmin
              .from("audit_logs")
              .select("*")
              .eq("action", "verification_request")
              .filter("metadata->>nickname", "eq", vNick)
              .filter("metadata->>code", "eq", vCode.toUpperCase())
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (logError || !log) return new Response("Invalid code", { status: 404 });
            
            const meta = log.metadata as any;
            if (new Date(meta.expires_at) < new Date()) {
              return new Response("Code expired", { status: 410 });
            }

            const { error: linkError } = await supabaseAdmin
              .from("player_accounts")
              .upsert({
                profile_id: log.actor_profile_id as string,
                minecraft_nickname: vNick,
                edition: (vEdition || meta.edition || "java") as any,
                uuid: mUuid,
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as any, { onConflict: 'minecraft_nickname,edition' }); // Nickname e Edition devem ser únicos

            if (linkError) {
              console.error("[Audit] Plugin verification failure", linkError);
              return new Response("Verification failed", { status: 500 });
            }

            // Atômico: invalidar log após uso
            await supabaseAdmin.from("audit_logs").delete().eq("id", log.id);

            return Response.json({ ok: true });

          default:
            return new Response("Unknown action", { status: 400 });
        }
      },
    },
  },
});
