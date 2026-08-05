import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Endpoint de saúde simplificado para Docker/K8s.
 */
export const getHealthStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
      const supabase = getPublicServerClient();
      const { error } = await supabase.from("site_settings").select("key").limit(1);
      if (error) throw error;
      return { status: "ok", timestamp: new Date().toISOString() };
    } catch (err: any) {
      return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 503 });
    }
  });

/**
 * Monitoramento detalhado para o Dashboard Administrativo.
 */
export const getSystemHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const supabase = getPublicServerClient();

    // 1. Banco de Dados
    const start = Date.now();
    const { error: dbError } = await supabase.from("site_settings").select("key").limit(1);
    const latency = Date.now() - start;

    // 2. Plugin (Mock por enquanto)
    const { data: pluginStatus } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "server_status")
      .maybeSingle();

    // 3. Fila de Entrega
    const { count: pendingCount } = await supabase
      .from("delivery_queue")
      .select("*", { count: 'exact', head: true })
      .eq("status", "pending");

    const { count: stuckCount } = await supabase
      .from("delivery_queue")
      .select("*", { count: 'exact', head: true })
      .eq("status", "failed");

    // 4. Checkout
    const hasMPToken = !!process.env['MERCADOPAGO_ACCESS_TOKEN'];

    return {
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbError ? 'offline' : 'online',
          latency: `${latency}ms`
        },
        plugin: {
          status: pluginStatus?.value === 'online' ? 'online' : 'offline',
          players: "0/100",
          last_heartbeat: new Date().toISOString()
        },
        delivery_queue: {
          pending: pendingCount || 0,
          stuck: stuckCount || 0
        },
        checkout: {
          configured: hasMPToken,
          mode: process.env['NODE_ENV'] === 'production' ? 'live' : 'sandbox'
        }
      }
    };
  });
