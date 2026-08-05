import { createFileRoute } from "@tanstack/react-router";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp,
  CreditCard,
  Truck,
  Tags,
  Activity,
  Bug,
  LifeBuoy,
  Clock,
  RefreshCw,
  Server
} from "lucide-react";

import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils/format";
import { useServerFn } from "@tanstack/react-start";
import { getOperationalMetrics } from "@/lib/services/admin-dashboard.functions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const getMetrics = useServerFn(getOperationalMetrics);
  
  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-operational-metrics'],
    queryFn: () => getMetrics(),
    refetchInterval: 30000, // Auto refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-xl uppercase text-foreground flex items-center gap-2">
            Dashboard Operacional
            {isRefetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h2>
          <p className="text-sm text-muted-foreground">Monitoramento em tempo real do lançamento.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            className="font-pixel text-[9px] uppercase pixel-border"
          >
            Atualizar Agora
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <div className="grid gap-4">
          {metrics.alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={cn(
                "p-4 pixel-border border-2 flex items-start gap-3",
                alert.type === 'critical' ? "bg-destructive/10 border-destructive text-destructive" : "bg-warning/10 border-warning text-warning-foreground"
              )}
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-pixel text-[10px] uppercase leading-none mb-1">Alerta {alert.type === 'critical' ? 'Crítico' : 'Operacional'}</p>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
          label="Receita Total" 
          value={formatBRL(metrics?.finance.revenue || 0)} 
          icon={DollarSign}
        />
        <AdminStatCard 
          label="Jogadores Online" 
          value={metrics?.users.online.toString() || "0"} 
          icon={Users}
          trend={{ value: `Pico: ${metrics?.users.peak}`, positive: true }}
        />
        <AdminStatCard 
          label="Pagamentos Pagos" 
          value={metrics?.finance.approved.toString() || "0"} 
          icon={CreditCard}
        />
        <AdminStatCard 
          label="Entregas Pendentes" 
          value={metrics?.operations.pendingDeliveries.toString() || "0"} 
          icon={Truck}
          className={metrics?.operations.pendingDeliveries && metrics.operations.pendingDeliveries > 10 ? "border-warning" : ""}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StonePanel title="Status da Infra" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel uppercase text-muted-foreground flex items-center gap-2">
                <Server className="h-3 w-3" /> Plugin / Heartbeat
              </span>
              <Badge variant={metrics?.health.pluginStatus === 'online' ? "secondary" : "destructive"} className="font-pixel text-[8px] bg-emerald-block/20 text-emerald-block border-emerald-block/30">
                {metrics?.health.pluginStatus === 'online' ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel uppercase text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3" /> Banco de Dados
              </span>
              <Badge variant="secondary" className="font-pixel text-[8px] bg-emerald-block/20 text-emerald-block border-emerald-block/30">ESTÁVEL</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel uppercase text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-3 w-3" /> Mercado Pago
              </span>
              <Badge variant="secondary" className="font-pixel text-[8px] bg-emerald-block/20 text-emerald-block border-emerald-block/30">OPERACIONAL</Badge>
            </div>
            <div className="pt-2 border-t border-black/5">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Última atualização: {metrics?.health.lastHeartbeat ? new Date(metrics.health.lastHeartbeat).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          </div>
        </StonePanel>

        <StonePanel title="Suporte e Qualidade" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-8 py-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/10 rounded flex items-center justify-center pixel-border border-blue-500/20">
                <LifeBuoy className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-pixel uppercase text-muted-foreground">Tickets Abertos</p>
                <p className="text-2xl font-bold">{metrics?.health.openTickets}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-500/10 rounded flex items-center justify-center pixel-border border-orange-500/20">
                <Bug className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-pixel uppercase text-muted-foreground">Bugs do Beta</p>
                <p className="text-2xl font-bold">{metrics?.health.betaBugs}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
            <p className="text-xs text-muted-foreground italic">Tempo médio de entrega: {Math.round(metrics?.operations.avgDeliveryTimeSeconds || 0)}s</p>
            <Button variant="ghost" size="sm" className="font-pixel text-[8px] uppercase h-7">Ver detalhes</Button>
          </div>
        </StonePanel>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <AdminStatCard 
          label="Usuários Totais" 
          value={metrics?.users.total.toString() || "0"} 
          icon={Users}
        />
        <AdminStatCard 
          label="Contas Vinculadas" 
          value={metrics?.users.linked.toString() || "0"} 
          icon={Activity}
        />
        <AdminStatCard 
          label="Pagamentos Pendentes" 
          value={metrics?.finance.pending.toString() || "0"} 
          icon={ShoppingBag}
        />
      </div>

    </div>
  );
}

