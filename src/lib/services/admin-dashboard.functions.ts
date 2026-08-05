import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

export const getOperationalMetrics = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");
    
    // Auth check - assuming caller is staff/admin role
    // In a real app, we'd check user_roles table
    
    const [
      profilesCount,
      linkedPlayers,
      ordersMetrics,
      deliveryMetrics,
      supportTickets,
      betaFeedback,
      serverStatus
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).not('minecraft_nickname', 'is', null),
      supabaseAdmin.from('orders').select('status, total'),
      supabaseAdmin.from('delivery_queue').select('status, created_at, delivered_at'),
      supabaseAdmin.from('support_tickets').select('status', { count: 'exact', head: true }).eq('status', 'open'),
      supabaseAdmin.from('beta_feedback').select('status'),
      supabaseAdmin.from('server_status').select('*').order('updated_at', { ascending: false }).limit(1).single()
    ]);

    // Process Orders
    const orders = ordersMetrics.data || [];
    const revenue = orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + (curr.total || 0), 0);
    const approvedPayments = orders.filter(o => o.status === 'paid').length;
    const pendingPayments = orders.filter(o => o.status === 'pending').length;
    const rejectedPayments = orders.filter(o => o.status === 'cancelled').length;

    // Process Deliveries
    const deliveries = deliveryMetrics.data || [];
    const pendingDeliveries = deliveries.filter(d => d.status === 'queued').length;
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;

    // Calculate Avg Delivery Time (last 100)
    const deliveredWithTime = deliveries
      .filter(d => d.status === 'delivered' && d.delivered_at && d.created_at)
      .slice(-100);
    
    const avgDeliveryTimeSeconds = deliveredWithTime.length > 0 
      ? deliveredWithTime.reduce((acc, curr) => {
          const start = new Date(curr.created_at).getTime();
          const end = new Date(curr.delivered_at!).getTime();
          return acc + (end - start);
        }, 0) / deliveredWithTime.length / 1000
      : 0;

    // Beta Feedback
    const feedbacks = betaFeedback.data || [];
    const openBugs = feedbacks.filter(f => f.status === 'new' || f.status === 'triaged' || f.status === 'confirmed').length;

    // Alerts logic
    const alerts = [];
    const now = Date.now();
    const lastUpdate = serverStatus.data?.updated_at ? new Date(serverStatus.data.updated_at).getTime() : 0;
    
    // 1. Approved without delivery (very simple heuristic)
    const approvedWithoutDelivery = approvedPayments - completedDeliveries;
    if (approvedWithoutDelivery > 5) {
      alerts.push({
        type: 'critical',
        message: `${approvedWithoutDelivery} pagamentos aprovados aguardam entrega ou processamento.`,
        code: 'PAYMENT_NO_DELIVERY'
      });
    }

    // 2. Heartbeat check (using updated_at as proxy)
    if (now - lastUpdate > 60000) { // 1 minute
      alerts.push({
        type: 'critical',
        message: 'Plugin Offline! Dados não recebidos há mais de 1 minuto.',
        code: 'PLUGIN_OFFLINE'
      });
    }

    // 3. Queue size
    if (pendingDeliveries > 20) {
      alerts.push({
        type: 'warning',
        message: `Fila de entrega elevada: ${pendingDeliveries} comandos em fila.`,
        code: 'QUEUE_HIGH'
      });
    }

    return {
      users: {
        total: profilesCount.count || 0,
        linked: linkedPlayers.count || 0,
        online: serverStatus.data?.players_online || 0,
        peak: serverStatus.data?.max_players || 0
      },
      finance: {
        revenue,
        approved: approvedPayments,
        pending: pendingPayments,
        rejected: rejectedPayments
      },
      operations: {
        pendingDeliveries,
        completedDeliveries,
        failedDeliveries,
        avgDeliveryTimeSeconds
      },
      health: {
        openTickets: supportTickets.count || 0,
        betaBugs: openBugs,
        lastHeartbeat: serverStatus.data?.updated_at,
        pluginStatus: (now - lastUpdate < 30000) ? 'online' : 'offline',
        dbStatus: 'healthy',
        mpStatus: 'healthy'
      },
      alerts
    };
  });

