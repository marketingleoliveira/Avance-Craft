import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/plugin")({
  server: {
    handlers: {
      // Heartbeat e status do servidor
      POST: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
        
        const token = authHeader.split(" ")[1];
        // Em prod, comparar hash do token vindo de site_settings ou env
        if (token !== process.env["PLUGIN_SECRET"]) return new Response("Forbidden", { status: 403 });

        const body = await request.json();
        const { action } = body;

        // Endpoint centralizado para ações do plugin
        switch (action) {
          case "get_deliveries":
            const { data: queue } = await supabaseAdmin
              .from("delivery_queue")
              .select("*")
              .eq("status", "queued")
              .lte("available_at", new Date().toISOString())
              .limit(50);
            
            if (queue?.length) {
              await supabaseAdmin
                .from("delivery_queue")
                .update({ status: "claimed", claimed_at: new Date().toISOString() })
                .in("id", queue.map(q => q.id));
            }
            return Response.json(queue || []);

          case "confirm_delivery":
            const { deliveryId, success, response } = body;
            await supabaseAdmin
              .from("delivery_queue")
              .update({ 
                status: (success ? "delivered" : "failed") as any, 
                delivered_at: success ? new Date().toISOString() : null,
                last_error: success ? null : response 
              })
              .eq("id", deliveryId);
            
            await supabaseAdmin.from("delivery_attempts").insert({
              delivery_queue_id: deliveryId,
              attempt_number: 1, // Logica de incremento aqui se necessário
              success,
              response
            });
            return Response.json({ ok: true });

          default:
            return new Response("Unknown action", { status: 400 });
        }
      },
    },
  },
});
