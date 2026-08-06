import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyPluginRequest } from "@/lib/plugin-auth/verify-plugin-request.server";
import { handleDeliverySuccess, handleDeliveryFailure } from "@/lib/services/delivery-processor.server";
import { logger } from "@/lib/config/logger.server";
import { pluginActionSchema } from "@/lib/plugin-auth/schemas";
import { z } from "zod";

export const Route = createFileRoute("/api/public/plugin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestId = crypto.randomUUID();
        
        try {
          // 1. Autenticação e Integridade via HMAC
          const auth = await verifyPluginRequest(request, supabaseAdmin);
          
          if (!auth.valid || !auth.serverId || !auth.body) {
            await logger.warn("plugin-api", "Unauthorized access attempt", { 
              context: { errorCode: auth.errorCode, requestId, ip: request.headers.get("x-forwarded-for") } 
            });
            return new Response(JSON.stringify({ 
              success: false,
              request_id: requestId,
              error: auth.errorCode || "unauthorized" 
            }), { 
              status: auth.status,
              headers: { "Content-Type": "application/json" }
            });
          }

          // 2. Validação de Payload com Zod
          let body;
          try {
            body = pluginActionSchema.parse(JSON.parse(auth.body));
          } catch (err) {
            const error = err as z.ZodError;
            return Response.json({ 
              success: false, 
              request_id: requestId, 
              error: "invalid_payload",
              details: error.errors 
            }, { status: 400 });
          }

          const serverId = auth.serverId;

          // 3. Roteamento de Ações
          switch (body.action) {
            case "get_deliveries": {
              const { data: queue, error: reserveError } = await supabaseAdmin.rpc("reserve_delivery_batch", {
                _server_id: serverId,
                _plugin_instance_id: body.plugin_instance_id,
                _limit: body.limit
              });
              
              if (reserveError) {
                await logger.error("plugin-api", "Failed to reserve deliveries", { 
                  context: { error: reserveError, serverId, requestId } 
                });
                return Response.json({ success: false, request_id: requestId, error: "internal_error" }, { status: 500 });
              }

              return Response.json({
                success: true,
                request_id: requestId,
                deliveries: (queue || []).map((q: any) => ({
                  delivery_id: q.id,
                  idempotency_key: q.idempotency_key,
                  player_name: q.player_name,
                  action: q.action,
                  payload: q.payload,
                  attempt: q.attempts
                }))
              });
            }

            case "confirm_delivery": {
              const { data: success, error } = await supabaseAdmin.rpc("confirm_delivery", {
                _delivery_id: body.delivery_id,
                _response_payload: body.execution_result
              });

              if (error) {
                return Response.json({ success: false, request_id: requestId, error: error.message }, { status: 500 });
              }

              // Lógica de orquestração pós-sucesso (ex: atualizar pedido)
              await handleDeliverySuccess(body.delivery_id, body.execution_result.message || "Confirmed", supabaseAdmin);

              return Response.json({ success: true, request_id: requestId });
            }

            case "fail_delivery": {
              const { error } = await supabaseAdmin.rpc("fail_delivery", {
                _delivery_id: body.delivery_id,
                _error_code: body.error_code,
                _error_message: body.error_message,
                _response_payload: { retryable: body.retryable }
              });

              if (error) {
                return Response.json({ success: false, request_id: requestId, error: error.message }, { status: 500 });
              }

              return Response.json({ success: true, request_id: requestId });
            }

            case "heartbeat": {
              await supabaseAdmin.from("minecraft_servers").update({
                last_seen_at: new Date().toISOString(),
                plugin_version: body.plugin_version,
                minecraft_version: body.minecraft_version,
                paper_version: body.paper_version
              } as any).eq("server_id", serverId);

              // Atualizar status em tempo real se os dados estiverem presentes
              if (body.online_players !== undefined) {
                await supabaseAdmin.from("server_status").upsert({
                  server_id: serverId,
                  players_online: body.online_players,
                  max_players: body.max_players || 0,
                  version: body.minecraft_version || "unknown",
                  online: true,
                  updated_at: new Date().toISOString()
                } as any, { onConflict: 'server_id' });
              }

              return Response.json({ success: true, request_id: requestId });
            }

            case "update_server_status": {
              await supabaseAdmin.from("server_status").upsert({
                server_id: serverId,
                players_online: body.players_online,
                max_players: body.max_players,
                version: body.version || "unknown",
                ip: body.ip || "",
                online: body.online,
                updated_at: new Date().toISOString()
              } as any, { onConflict: 'server_id' });
              
              return Response.json({ success: true, request_id: requestId });
            }

            case "healthcheck": {
              return Response.json({ 
                success: true, 
                request_id: requestId, 
                status: "ok", 
                server_id: serverId,
                timestamp: new Date().toISOString()
              });
            }

            default:
              return Response.json({ success: false, request_id: requestId, error: "unknown_action" }, { status: 400 });
          }
        } catch (error) {
          const err = error as Error;
          await logger.error("plugin-api", "Critical failure in plugin route", { 
            context: { error: err.message, requestId } 
          });
          return Response.json({ 
            success: false, 
            request_id: requestId, 
            error: "internal_server_error" 
          }, { status: 500 });
        }
      },
    },
  },
});
