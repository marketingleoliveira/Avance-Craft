import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetPluginIntegrationStatus, adminSimulatePluginRequest } from "@/lib/services/admin-plugin-test.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { 
  Activity, 
  Terminal, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  RefreshCcw, 
  Server, 
  Users, 
  Database,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/plugin-teste")({
  component: PluginTestHarness,
});

function PluginTestHarness() {
  const getStatus = useServerFn(adminGetPluginIntegrationStatus);
  const simulate = useServerFn(adminSimulatePluginRequest);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["plugin-integration-status"],
    queryFn: () => getStatus(),
    refetchInterval: 5000,
  });

  const mutation = useMutation({
    mutationFn: (vars: { scenario: string }) => simulate({ data: vars }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Teste concluído com sucesso!");
      } else {
        toast.error(`Falha no teste: ${res.status}`);
      }
      refetch();
    },
  });

  const scenarios = [
    { id: "HEARTBEAT_VALID", label: "Heartbeat Válido", icon: CheckCircle2, color: "text-green-500" },
    { id: "INVALID_SIGNATURE", label: "Assinatura Inválida", icon: ShieldCheck, color: "text-red-500" },
    { id: "EXPIRED_TIMESTAMP", label: "Timestamp Expirado", icon: Clock, color: "text-orange-500" },
    { id: "REPLAY_NONCE", label: "Nonce Repetido", icon: RefreshCcw, color: "text-purple-500" },
  ];

  if (isLoading && !data) return <div className="p-8 text-center font-minecraft">Carregando suíte de testes...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">
      <header className="mb-8">
        <h1 className="text-4xl font-minecraft text-white flex items-center gap-3">
          <Terminal className="text-blue-500 w-10 h-10" />
          Plugin Integration Harness
        </h1>
        <p className="text-muted-foreground mt-2">Validação técnica de Handshake, Heartbeat e Fila de Comandos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA 1: STATUS DO PLUGIN */}
        <div className="space-y-6">
          <StonePanel className="p-6">
            <h2 className="text-xl font-minecraft text-yellow-500 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              STATUS DO PLUGIN
            </h2>
            
            <div className="space-y-4">
              <div className="bg-black/40 p-4 border border-white/5 rounded-sm">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Último Heartbeat</span>
                <span className="text-sm font-mono text-blue-400">
                  {data?.heartbeat?.updated_at ? new Date(data.heartbeat.updated_at).toLocaleString() : 'NUNCA'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 border border-white/5 rounded-sm">
                  <Server className="w-4 h-4 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground uppercase block">Versão</span>
                  <span className="text-xs font-minecraft">v1.2.0-rc</span>
                </div>
                <div className="bg-black/40 p-3 border border-white/5 rounded-sm">
                  <Users className="w-4 h-4 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground uppercase block">Jogadores</span>
                  <span className="text-xs font-minecraft">{data?.heartbeat?.players_online || 0}</span>
                </div>
              </div>

              <div className={`p-4 rounded-sm border flex items-center gap-3 ${
                data?.heartbeat?.online ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {data?.heartbeat?.online ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-xs font-bold uppercase">Status: {data?.heartbeat?.online ? 'OPERACIONAL' : 'DESCONECTADO'}</span>
              </div>
            </div>
          </StonePanel>

          <StonePanel className="p-6">
            <h2 className="text-xl font-minecraft text-blue-500 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5" />
              FILA DE ENTREGA
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-black/20 rounded border border-white/5">
                <div className="text-2xl font-minecraft text-white">{data?.stats.queued}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Pendentes</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded border border-white/5">
                <div className="text-2xl font-minecraft text-green-500">{data?.stats.delivered}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Sucesso</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded border border-white/5">
                <div className="text-2xl font-minecraft text-red-500">{data?.stats.failed}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Falhas</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded border border-white/5">
                <div className="text-2xl font-minecraft text-orange-400">{data?.stats.total_attempts}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Tentativas</div>
              </div>
            </div>
          </StonePanel>
        </div>

        {/* COLUNA 2: CENÁRIOS DE TESTE */}
        <div className="lg:col-span-2 space-y-6">
          <StonePanel className="p-6">
            <h2 className="text-xl font-minecraft text-orange-400 mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              SUÍTE DE CENÁRIOS (STAGING)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((s) => (
                <div key={s.id} className="group p-4 bg-black/40 border border-white/10 rounded-sm hover:border-blue-500/50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <span className="text-sm font-minecraft text-gray-300">{s.label}</span>
                  </div>
                  <PixelButton 
                    className="px-4 py-1 text-[10px] h-8"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ scenario: s.id })}
                  >
                    EXECUTAR
                  </PixelButton>
                </div>
              ))}
            </div>

            {mutation.data && (
              <div className="mt-6 p-4 bg-black/60 border border-white/10 rounded-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-minecraft text-blue-400">RESULTADO DO ÚLTIMO TESTE</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${mutation.data.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    HTTP {mutation.data.status}
                  </span>
                </div>
                <p className="text-xs italic text-gray-400 mb-2">{mutation.data.description}</p>
                <pre className="text-[10px] font-mono bg-black/40 p-2 rounded text-blue-300 overflow-x-auto">
                  {mutation.data.payload}
                </pre>
              </div>
            )}
          </StonePanel>

          <StonePanel className="p-6">
            <h2 className="text-xl font-minecraft text-muted-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              LOGS DE INTEGRAÇÃO (SANITIZADOS)
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {data?.logs.map((log: any) => (
                <div key={log.id} className="p-2 bg-black/20 border-l-2 border-white/10 text-[10px] font-mono hover:bg-black/40 transition-colors">
                  <span className="text-gray-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                  <span className="text-blue-400 ml-2 uppercase">{log.action}:</span>
                  <span className="text-gray-300 ml-2">{log.entity}</span>
                  <span className="text-gray-500 ml-2">ID: {log.entity_id}</span>
                </div>
              ))}
              {data?.logs.length === 0 && (
                <div className="text-center py-8 text-gray-600 italic text-xs">Nenhum evento registrado.</div>
              )}
            </div>
          </StonePanel>
        </div>
      </div>
    </div>
  );
}
