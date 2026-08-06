import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/ui-kit/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyProfile, listMyOrders, listMyPlayerAccounts } from "@/lib/services/orders.functions";
import { generateLinkCode, unlinkAccount } from "@/lib/services/account-link.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  ShoppingBag, 
  Settings, 
  Ticket, 
  CreditCard, 
  Box, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  LogOut,
  ChevronRight,
  Shield,
  History,
  Link2,
  Unlink,
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollReveal } from "@/components/ui-kit/Motion";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil | Avance" },
      { name: "description", content: "Gerencie seus pedidos, vincule sua conta Minecraft e acompanhe suas conquistas no Avance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/auth",
        search: {
          next: "/perfil"
        }
      });
    }
  },

  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["my-profile"],
      queryFn: () => getMyProfile(),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["my-orders"],
      queryFn: () => listMyOrders(),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["my-accounts"],
      queryFn: () => listMyPlayerAccounts(),
    });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const fetchProfile = useServerFn(getMyProfile);
  const fetchOrders = useServerFn(listMyOrders);
  const fetchAccounts = useServerFn(listMyPlayerAccounts);
  const navigate = useNavigate();

  const { data: profile } = useSuspenseQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const { data: orders } = useSuspenseQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(),
  });

  const { data: accounts } = useSuspenseQuery({
    queryKey: ["my-accounts"],
    queryFn: () => fetchAccounts(),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!profile) {
    return null;
  }

  const primaryAccount = accounts?.[0];

  return (
    <main className="min-h-screen py-24 bg-stone-950 text-white">
      <Container className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-32">
          <Card className="p-8 text-center flex flex-col items-center">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl group-hover:bg-emerald-500/40 transition-colors" />
              <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/20 shadow-2xl">
                <img 
                  src={`https://mc-heads.net/avatar/${primaryAccount?.minecraft_nickname || 'Steve'}/96`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-stone-900 shadow-lg">
                <Shield className="w-3.5 h-3.5 text-stone-950" />
              </div>
            </div>

            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-1">
              {profile.username || "Jogador"}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {profile.role === 'admin' ? 'Administrador' : 'Membro Premium'}
            </div>
            
            <div className="w-full mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Saldo</p>
                <p className="text-lg font-black italic text-emerald-400">0 CASH</p>
              </div>
              <div className="text-left border-l border-white/5 pl-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Nível</p>
                <p className="text-lg font-black italic text-white">42</p>
              </div>
            </div>
          </Card>

          <nav className="flex flex-col gap-3">
            <ProfileNavItem icon={User} label="Visão Geral" active />
            <ProfileNavItem icon={ShoppingBag} label="Meus Pedidos" />
            <ProfileNavItem icon={Ticket} label="Central de Tickets" />
            <ProfileNavItem icon={Settings} label="Segurança & Conta" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 font-black text-[11px] uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all rounded-2xl group mt-4"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Sair da conta
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">Área do Jogador</span>
              <h1 className="text-4xl md:text-6xl font-[900] uppercase italic tracking-tighter text-white">
                Dashboard
              </h1>
            </div>
            <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">ID Único:</span>
              <span className="ml-2 font-mono text-xs text-white">#{profile.id.slice(0, 8)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="Conta Minecraft" 
              value={primaryAccount?.minecraft_nickname || "Não vinculado"} 
              subtitle={primaryAccount ? `Edição ${primaryAccount.edition}` : "Vincule agora"}
              icon={Box}
              color="text-emerald-500"
            />
            <StatCard 
              label="Investimento Total" 
              value={`R$ ${orders?.reduce((acc, o) => acc + (o.status === 'paid' ? o.total : 0), 0).toFixed(2)}`} 
              subtitle={`${orders?.filter(o => o.status === 'paid').length || 0} pedidos confirmados`}
              icon={CreditCard}
              color="text-white"
            />
            <StatCard 
              label="Vantagens Ativas" 
              value="3 Ativos" 
              subtitle="Expira em 12 dias"
              icon={Shield}
              color="text-emerald-500"
            />
          </div>

          {/* Vinculação de Conta */}
          <AccountLinkSection accounts={accounts} />

          {/* Pedidos Recentes */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xl font-black uppercase italic tracking-wider text-white">Histórico de Pedidos</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px]">Ver tudo</Button>
            </div>

            {orders?.length === 0 ? (
              <Card className="p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                  <ShoppingBag className="w-8 h-8 text-stone-500" />
                </div>
                <h4 className="text-lg font-black uppercase italic text-stone-400 mb-2">Sem atividade comercial</h4>
                <p className="text-stone-500 font-medium mb-8 max-w-xs">Sua conta ainda não possui registros de compras na nossa loja oficial.</p>
                <Button asChild className="h-14 px-10">
                  <Link to="/loja">Visitar Loja Premium</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders?.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
      
      <ScrollReveal className="mt-32">
        <SiteFooter />
      </ScrollReveal>
    </main>
  );
}

function ProfileNavItem({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <button className={cn(
      "flex items-center justify-between p-5 rounded-2xl transition-all border group",
      active 
        ? "bg-emerald-500 border-emerald-500 text-stone-950 shadow-xl shadow-emerald-500/20" 
        : "bg-white/[0.02] border-white/5 text-stone-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-white"
    )}>
      <div className="flex items-center gap-4">
        <Icon className={cn("w-5 h-5", active ? "text-stone-950" : "text-emerald-500")} />
        <span className="font-black uppercase italic tracking-widest text-[11px]">{label}</span>
      </div>
      <ChevronRight className={cn("w-4 h-4 transition-transform", active ? "translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
    </button>
  );
}

function StatCard({ label, value, subtitle, icon: Icon, color }: { label: string; value: string; subtitle: string; icon: any; color: string }) {
  return (
    <Card className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <Icon className={cn("w-6 h-6", color === 'text-emerald-500' ? 'text-emerald-500' : 'text-white')} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">{label}</p>
        <p className={cn("text-2xl font-black uppercase italic tracking-tight mb-2", color)}>{value}</p>
        <p className="text-xs font-medium text-stone-500">{subtitle}</p>
      </div>
    </Card>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pendente", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
    paid: { label: "Pago", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    delivered: { label: "Entregue", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    cancelled: { label: "Cancelado", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: XCircle },
    failed: { label: "Falha", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle },
  };

  const status = statusMap[order.status] || { label: order.status, color: "text-stone-500 bg-white/5 border-white/10", icon: AlertCircle };

  return (
    <Card className="p-0 hover:bg-white/[0.04]">
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            <ShoppingBag className="w-8 h-8 text-stone-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-stone-500">#{order.id.slice(0, 8)}</span>
              <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", status.color)}>
                {status.label}
              </span>
            </div>
            <h4 className="text-lg font-black uppercase italic text-white truncate">
              {order.items?.length || 0} Itens Adquiridos
            </h4>
            <p className="text-sm font-medium text-stone-500">
              {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Total</p>
            <p className="text-2xl font-black text-white italic">R$ {order.total.toFixed(2)}</p>
          </div>
          <Button variant="secondary" className="h-14 px-8">Detalhes</Button>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <TimelineStep active={true} label="Pedido" />
          <div className={cn("flex-1 h-1 rounded-full", order.paid_at ? "bg-emerald-500" : "bg-white/5")} />
          <TimelineStep active={!!order.paid_at} label="Pagamento" />
          <div className={cn("flex-1 h-1 rounded-full", order.status === 'delivered' ? "bg-emerald-500" : "bg-white/5")} />
          <TimelineStep active={order.status === 'delivered'} label="Entrega" />
        </div>
      </div>
    </Card>
  );
}

function TimelineStep({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "w-3 h-3 rounded-full transition-all duration-500",
        active ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-125" : "bg-white/10"
      )} />
      <span className={cn("text-[9px] font-black uppercase tracking-widest", active ? "text-emerald-500" : "text-stone-600")}>
        {label}
      </span>
    </div>
  );
}
