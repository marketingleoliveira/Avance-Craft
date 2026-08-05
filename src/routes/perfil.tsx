import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui-kit/Container";
import { Card } from "@/components/ui-kit/Card";
import { <h2 class="text-3xl font-[900] uppercase italic tracking-tighter text-white"> } from "@/components/ui-kit/<h2 class="text-3xl font-[900] uppercase italic tracking-tighter text-white">";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { getMyProfile, listMyOrders, listMyPlayerAccounts } from "@/lib/services/orders.functions";
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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollReveal } from "@/components/ui-kit/Motion";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil | Avance" },
      { name: "description", content: "Gerencie seus pedidos, vincule sua conta Minecraft e acompanhe suas conquistas no Avance." },
      { name: "robots", content: "noindex, nofollow" }, // Privado
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
    <main className="py-12 bg-parchment/30">
      <Container className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          <Card className="p-6 text-center">
            <div className="relative mx-auto mb-4 w-24 h-24 pixel-border border-dirt-dark bg-stone overflow-hidden">
               {/* Avatar Placeholder - Voxel Head */}
               <div className="absolute inset-0 flex flex-col">
                  <div className="h-1/2 bg-wood-dark"></div>
                  <div className="h-1/2 bg-dirt"></div>
                  <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white border border-black/20"></div>
                  <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white border border-black/20"></div>
               </div>
            </div>
            <h2 className="font-pixel text-[11px] uppercase text-dirt-dark truncate px-2">
              {profile.username || "Jogador"}
            </h2>
            <p className="text-[10px] font-pixel text-grass-dark mt-1">
              {profile.role === 'admin' ? 'Administrador' : 'Membro'}
            </p>
            
            <div className="mt-6 pt-6 border-t-2 border-dirt-dark/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-pixel text-muted-foreground uppercase">Saldo</p>
                <p className="font-pixel text-[10px] text-dirt-dark">0 Cash</p>
              </div>
              <div>
                <p className="text-[9px] font-pixel text-muted-foreground uppercase">VIP</p>
                <p className="font-pixel text-[10px] text-emerald-block">Nenhum</p>
              </div>
            </div>
          </Card>

          <nav className="flex flex-col gap-2">
            <ProfileNavItem icon={User} label="Visão Geral" active />
            <ProfileNavItem icon={ShoppingBag} label="Histórico" />
            <ProfileNavItem icon={Ticket} label="Meus Tickets" />
            <ProfileNavItem icon={Settings} label="Configurações" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 font-pixel text-[10px] uppercase text-red-600 hover:bg-red-50 transition-colors w-full text-left mt-4"
            >
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <<h2 class="text-3xl font-[900] uppercase italic tracking-tighter text-white"> subtitle="Bem-vindo à sua área exclusiva">
              Seu Perfil
            </<h2 class="text-3xl font-[900] uppercase italic tracking-tighter text-white">>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-pixel uppercase text-muted-foreground">ID: #{profile.id.slice(0, 8)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              label="Conta Minecraft" 
              value={primaryAccount?.minecraft_nickname || "Não vinculado"} 
              subtitle={primaryAccount ? `Edição ${primaryAccount.edition}` : "Vincule agora"}
              icon={Box}
            />
            <StatCard 
              label="Total Gasto" 
              value={`R$ ${orders?.reduce((acc, o) => acc + (o.status === 'paid' ? o.total : 0), 0).toFixed(2)}`} 
              subtitle={`${orders?.filter(o => o.status === 'paid').length || 0} pedidos concluídos`}
              icon={CreditCard}
            />
            <StatCard 
              label="Cupons" 
              value="0" 
              subtitle="Nenhum ativo no momento"
              icon={Ticket}
            />
          </div>

          {/* Histórico de Pedidos */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-[11px] uppercase text-dirt-dark">Últimos Pedidos</h3>
              <button className="text-[9px] font-pixel text-grass-dark uppercase hover:underline">Ver todos</button>
            </div>

            {orders?.length === 0 ? (
              <Card className="p-12 text-center opacity-70">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-pixel text-[10px] text-muted-foreground uppercase">Você ainda não realizou compras.</p>
                <Link to="/loja">
                  <PixelButton variant="wood" className="mt-4">Visitar Loja</PixelButton>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders?.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
      
      <ScrollReveal className="mt-20">
        <SiteFooter />
      </ScrollReveal>
    </main>
  );
}

function ProfileNavItem({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <button className={cn(
      "flex items-center gap-3 p-4 font-pixel text-[10px] uppercase transition-all",
      active ? "bg-wood border-2 border-wood-dark text-dirt-dark shadow-[0_4px_0_0_var(--wood-dark)]" : "text-muted-foreground hover:text-dirt-dark"
    )}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function StatCard({ label, value, subtitle, icon: Icon }: { label: string; value: string; subtitle: string; icon: any }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[9px] font-pixel text-muted-foreground uppercase">{label}</p>
        <Icon className="w-4 h-4 text-grass-dark" />
      </div>
      <p className="font-pixel text-sm text-dirt-dark truncate">{value}</p>
      <p className="text-[9px] text-muted-foreground mt-1">{subtitle}</p>
    </Card>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Aguardando Pagamento", color: "text-amber-600", icon: Clock },
    paid: { label: "Pago", color: "text-emerald-block", icon: CheckCircle2 },
    delivered: { label: "Entregue", color: "text-emerald-block", icon: CheckCircle2 },
    cancelled: { label: "Cancelado", color: "text-red-600", icon: XCircle },
    failed: { label: "Falha na Entrega", color: "text-amber-600", icon: AlertCircle },
  };

  const status = statusMap[order.status] || { label: order.status, color: "text-muted-foreground", icon: AlertCircle };
  const StatusIcon = status.icon;

  return (
    <Card className="p-0 overflow-hidden group">
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div className="h-12 w-12 bg-dirt-dark/10 grid place-items-center rounded-sm">
          <ShoppingBag className="w-6 h-6 text-dirt-dark" />
        </div>
        
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <span className="font-pixel text-[10px] text-dirt-dark">#{order.id.slice(0, 8)}</span>
            <span className={cn("font-pixel text-[8px] uppercase px-1.5 py-0.5 bg-black/5 rounded-sm", status.color)}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {order.items?.length || 0} itens • {new Date(order.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="text-right">
          <p className="font-pixel text-sm text-dirt-dark">R$ {order.total.toFixed(2)}</p>
          <button className="text-[9px] font-pixel text-grass-dark uppercase mt-1 flex items-center justify-end gap-1 group-hover:underline">
            Ver detalhes <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Timeline (Miniatura) */}
      <div className="bg-black/5 p-4 border-t-2 border-dirt-dark/5 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
           <TimelineStep active={true} label="Pedido Criado" />
           <div className={cn("w-8 sm:w-16 h-1", order.paid_at ? "bg-emerald-block/30" : "bg-muted/20")}></div>
           <TimelineStep active={!!order.paid_at} label="Pagamento" />
           <div className={cn("w-8 sm:w-16 h-1", order.status === 'delivered' ? "bg-emerald-block/30" : "bg-muted/20")}></div>
           <TimelineStep active={order.status === 'delivered'} label="Entregue" />
        </div>
      </div>
    </Card>
  );
}

function TimelineStep({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-3 h-3 pixel-border border-dirt-dark",
        active ? "bg-emerald-block shadow-[0_0_8px_rgba(34,197,94,0.3)]" : "bg-stone"
      )}></div>
      <span className={cn("text-[8px] font-pixel uppercase", active ? "text-dirt-dark" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}
