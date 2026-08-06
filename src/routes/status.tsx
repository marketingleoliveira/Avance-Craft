import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { getPublicServerStatus } from "@/lib/services/status.functions";
import { listServerModes } from "@/lib/services/content.functions";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Settings, 
  Activity, 
  Terminal, 
  Clock, 
  Wifi, 
  WifiOff,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/status")({
  head: () => {
    const title = "Status do Servidor — Avance";
    const description = "Confira em tempo real o status, jogadores online e saúde técnica do Avance.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StatusPage,
});

function StatusCard({ icon: Icon, label, value, colorClass = "text-foreground" }: any) {
  return (
    <div className="pixel-border border-dirt-dark/20 bg-dirt/10 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border-2 border-dirt-dark/15 bg-dirt/5">
          <Icon className={cn("h-5 w-5", colorClass)} />
        </div>
        <div>
          <p className="font-pixel text-[8px] uppercase text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusPage() {
  const { data: status } = useSuspenseQuery({
    queryKey: ["server-status-page"],
    queryFn: () => getPublicServerStatus(),
  });

  const { data: modes } = useSuspenseQuery({
    queryKey: ["server-modes"],
    queryFn: () => listServerModes(),
  });

  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const copy = (text: string, type: 'java' | 'bedrock') => {
    navigator.clipboard.writeText(text);
    setCopiedIp(type);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const isOnline = status?.online ?? false;
  const effectivelyOnline = isOnline && status?.status !== 'offline';
  const lastHeartbeat = status?.lastUpdate ? new Date(status.lastUpdate) : null;

  return (
    <main className="min-h-screen py-20">
      <Container>
        <WoodSign subtitle="Monitoramento técnico e disponibilidade da nossa rede.">
          Status da Rede
        </WoodSign>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Status Geral */}
          <div className="lg:col-span-2">
            <StonePanel title="Geral">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatusCard 
                  icon={effectivelyOnline ? Wifi : WifiOff} 
                  label="Estado Atual" 
                  value={status?.status === 'online' ? "Online" : status?.status === 'unstable' ? "Instável" : status?.status === 'maintenance' ? "Manutenção" : "Offline"}
                  colorClass={status?.status === 'online' ? "text-emerald-block" : status?.status === 'unstable' ? "text-amber-500" : "text-destructive"}
                />
                <StatusCard 
                  icon={Users} 
                  label="Jogadores Online" 
                  value={`${status?.players ?? 0} / ${status?.maxPlayers ?? 500}`}
                  colorClass="text-emerald-block"
                />
                <StatusCard 
                  icon={Settings} 
                  label="Versão" 
                  value={status?.version ?? "1.20.x"}
                />
                <StatusCard 
                  icon={Clock} 
                  label="Último Heartbeat" 
                  value={lastHeartbeat ? lastHeartbeat.toLocaleTimeString('pt-BR') : "N/A"}
                />
              </div>

              <div className="mt-8 border-t-2 border-dirt-dark/10 pt-8">
                <h3 className="font-pixel text-xs uppercase mb-4">Modos Disponíveis</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {modes.map((mode: any) => (
                    <div key={mode.id} className="pixel-border border-dirt-dark/15 bg-stone/30 p-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2",
                          mode.available ? "bg-emerald-block" : "bg-destructive"
                        )} />
                        <span className="font-bold text-sm">{mode.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StonePanel>
          </div>

          {/* IPs de Conexão */}
          <div className="lg:col-span-1">
            <StonePanel title="Conectar">
              <div className="space-y-6">
                <div>
                  <label className="font-pixel text-[9px] uppercase text-muted-foreground block mb-2">Java Edition</label>
                  <button 
                    onClick={() => copy("jogar.avancemine.com.br", 'java')}
                    className="pixel-border flex w-full items-center justify-between border-grass-dark bg-grass-dark/10 p-3 text-left hover:bg-grass-dark/20 transition-colors"
                  >
                    <span className="font-bold truncate">{status?.ip ?? "jogar.avance.com.br"}</span>
                    {copiedIp === 'java' ? <Check className="h-4 w-4 text-emerald-block" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div>
                  <label className="font-pixel text-[9px] uppercase text-muted-foreground block mb-2">Bedrock Edition</label>
                  <div className="space-y-2">
                  <button 
                    onClick={() => copy("bedrock.avance.com.br", 'bedrock')}
                    className="pixel-border flex w-full items-center justify-between border-dirt-dark bg-dirt-dark/10 p-3 text-left hover:bg-dirt-dark/20 transition-colors"
                  >
                    <span className="font-bold truncate">bedrock.avance.com.br</span>
                    {copiedIp === 'bedrock' ? <Check className="h-4 w-4 text-emerald-block" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <div className="flex items-center gap-2 px-1">
                    <span className="font-pixel text-[8px] uppercase text-muted-foreground">Porta:</span>
                    <span className="font-bold text-sm">19132</span>
                  </div>
                  </div>
                </div>

                <div className="pt-4">
                  <PixelButton variant="emerald" className="w-full">
                    Como entrar?
                  </PixelButton>
                </div>
              </div>
            </StonePanel>
          </div>
        </div>
      </Container>
    </main>
  );
}
