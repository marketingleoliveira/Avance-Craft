import { createFileRoute } from "@tanstack/react-router";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp,
  CreditCard,
  Truck
} from "lucide-react";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-xl uppercase text-foreground">Visão Geral</h2>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta ao centro de comando.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-pixel text-[9px] uppercase pixel-border">Relatórios</Button>
          <Button className="font-pixel text-[9px] uppercase bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark">Exportar</Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
          label="Faturamento Hoje" 
          value={formatBRL(0)} 
          icon={DollarSign}
          trend={{ value: "0%", positive: true }}
        />
        <AdminStatCard 
          label="Faturamento Mês" 
          value={formatBRL(0)} 
          icon={TrendingUp}
          trend={{ value: "0%", positive: true }}
        />
        <AdminStatCard 
          label="Pedidos Pagos" 
          value="0" 
          icon={CreditCard}
        />
        <AdminStatCard 
          label="Jogadores Online" 
          value="0" 
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StonePanel title="Alertas Operacionais">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 bg-stone-dark/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="font-pixel text-[9px] uppercase text-muted-foreground">Nenhum alerta crítico</p>
            <p className="text-xs text-muted-foreground mt-1">O sistema está operando normalmente.</p>
          </div>
        </StonePanel>

        <StonePanel title="Vendas Recentes">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/20 mb-3" />
            <p className="font-pixel text-[9px] uppercase text-muted-foreground">Sem vendas no período</p>
            <p className="text-xs text-muted-foreground mt-1">As transações aparecerão aqui assim que ocorrerem.</p>
          </div>
        </StonePanel>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <AdminStatCard 
          label="Ticket Médio" 
          value={formatBRL(0)} 
          icon={Tags}
        />
        <AdminStatCard 
          label="Entregas com Falha" 
          value="0" 
          icon={Truck}
          className="border-destructive/20"
        />
      </div>
    </div>
  );
}
