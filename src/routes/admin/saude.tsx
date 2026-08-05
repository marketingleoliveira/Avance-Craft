import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getSystemHealth } from '@/lib/services/health.functions';
import { StonePanel } from '@/components/ui/StonePanel';
import { WoodSign } from '@/components/ui/WoodSign';
import { Container } from '@/components/ui/Container';
import { 
  Activity, 
  Database, 
  CreditCard, 
  Server, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Users
} from 'lucide-react';

export const Route = createFileRoute('/admin/saude')({
  component: AdminHealthPage,
});

function AdminHealthPage() {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => getSystemHealth(),
    refetchInterval: 30000, // Auto refresh every 30s
  });

  if (isLoading) return <Container className="py-12"><div className="text-center text-white">Carregando status do sistema...</div></Container>;

  const services = health?.services;

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'online' || status === 'healthy') return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
    if (status === 'offline' || status === 'unhealthy') return <XCircle className="text-red-500 w-5 h-5" />;
    return <AlertTriangle className="text-amber-500 w-5 h-5" />;
  };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <WoodSign variant="small" className="mb-2">Painel de Saúde</WoodSign>
        <p className="text-muted-foreground">Monitoramento em tempo real da infraestrutura do Habblet Mine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Database */}
        <StonePanel className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <h3 className="font-pixel text-sm">Banco de Dados</h3>
            </div>
            <StatusIcon status={services?.database.status || ''} />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latência:</span>
              <span className="text-white font-mono">{services?.database.latency}</span>
            </div>
          </div>
        </StonePanel>

        {/* Plugin */}
        <StonePanel className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="font-pixel text-sm">Plugin Minecraft</h3>
            </div>
            <StatusIcon status={services?.plugin.status || ''} />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jogadores:</span>
              <span className="text-white">{services?.plugin.players}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heartbeat:</span>
              <span className="text-white text-[10px]">
                {services?.plugin.last_heartbeat ? new Date(services.plugin.last_heartbeat).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </StonePanel>

        {/* Delivery */}
        <StonePanel className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="font-pixel text-sm">Fila de Entrega</h3>
            </div>
            <StatusIcon status={services?.delivery_queue.stuck && services.delivery_queue.stuck > 0 ? 'warning' : 'online'} />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendentes:</span>
              <span className="text-white">{services?.delivery_queue.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Falhas:</span>
              <span className={`font-bold ${services?.delivery_queue.stuck && services.delivery_queue.stuck > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {services?.delivery_queue.stuck}
              </span>
            </div>
          </div>
        </StonePanel>

        {/* Checkout */}
        <StonePanel className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h3 className="font-pixel text-sm">Mercado Pago</h3>
            </div>
            <StatusIcon status={services?.checkout.configured ? 'online' : 'offline'} />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modo:</span>
              <span className="text-white uppercase">{services?.checkout.mode}</span>
            </div>
          </div>
        </StonePanel>
      </div>

      <StonePanel className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-pixel">Alertas de Sistema</h2>
        </div>

        <div className="space-y-4">
          {services?.delivery_queue.stuck && services.delivery_queue.stuck > 10 && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3">
              <XCircle className="text-red-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-red-500">Fila de Entregas Acumulada</h4>
                <p className="text-sm text-red-200/80">Existem mais de 10 entregas falhas que requerem atenção manual.</p>
              </div>
            </div>
          )}

          {services?.plugin.status === 'offline' && (
            <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-amber-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-500">Plugin Offline</h4>
                <p className="text-sm text-amber-200/80">O servidor de Minecraft não está enviando heartbeats há mais de 1 minuto.</p>
              </div>
            </div>
          )}

          {!services?.checkout.configured && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3">
              <XCircle className="text-red-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-red-500">Checkout Indisponível</h4>
                <p className="text-sm text-red-200/80">As credenciais do Mercado Pago não foram configuradas. Vendas estão bloqueadas.</p>
              </div>
            </div>
          )}

          {services?.database.status === 'online' && services.plugin.status === 'online' && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-500">Operação Normal</h4>
                <p className="text-sm text-emerald-200/80">Todos os sistemas críticos estão operando dentro dos parâmetros esperados.</p>
              </div>
            </div>
          )}
        </div>
      </StonePanel>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => refetch()}
          className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
        >
          <Clock className="w-3 h-3" />
          Última atualização: {new Date(health?.timestamp || '').toLocaleTimeString()} (Clique para atualizar)
        </button>
      </div>
    </Container>
  );
}
