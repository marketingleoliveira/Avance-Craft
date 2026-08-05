import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getSystemHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    // 1. Check Database
    const dbStart = Date.now();
    const { data: dbCheck, error: dbError } = await supabaseAdmin.from('site_settings').select('count').limit(1);
    const dbLatency = Date.now() - dbStart;

    // 2. Check Plugin Heartbeat
    const { data: status } = await supabaseAdmin
      .from('server_status')
      .select('updated_at, online, players_online')
      .single();
    
    const lastHeartbeat = status?.updated_at ? new Date(status.updated_at) : null;
    const isPluginActive = lastHeartbeat && (Date.now() - lastHeartbeat.getTime()) < 60000;

    // 3. Check Delivery Queue
    const { count: stuckDeliveries } = await supabaseAdmin
      .from('delivery_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    const { count: pendingDeliveries } = await supabaseAdmin
      .from('delivery_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 4. Check Checkout Config
    const hasMpKeys = !!(process.env['MP_ACCESS_TOKEN'] || process.env['VITE_MP_PUBLIC_KEY']);

    return {
      status: dbError ? 'unhealthy' : 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbError ? 'offline' : 'online',
          latency: `${dbLatency}ms`,
          error: dbError?.message
        },
        plugin: {
          status: isPluginActive ? 'online' : 'offline',
          last_heartbeat: lastHeartbeat?.toISOString(),
          players: status?.players_online || 0
        },
        delivery_queue: {
          pending: pendingDeliveries || 0,
          stuck: stuckDeliveries || 0
        },
        checkout: {
          configured: hasMpKeys,
          mode: process.env['NODE_ENV'] === 'production' ? 'live' : 'sandbox'
        }
      }
    };
  });
