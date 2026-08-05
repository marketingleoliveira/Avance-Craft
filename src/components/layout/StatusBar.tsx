import { useEffect, useRef, useState } from "react";
import { Copy, Check, Zap, Users, Monitor, Smartphone } from "lucide-react";
import { Container } from "@/components/ui-kit/Container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getServerStatus } from "@/lib/services/content.functions";
import { cn } from "@/lib/utils";

const DEFAULT_STATUS = {
  online: true,
  players_online: 0,
  max_players: 100,
  version: "1.21+",
  ip: "jogar.avance.com.br"
};

export function StatusBar() {
  const { data: serverStatus } = useSuspenseQuery({
    queryKey: ["server-status"],
    queryFn: () => getServerStatus(),
  });

  const status = serverStatus ?? DEFAULT_STATUS;

  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(status.ip);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-black/90 backdrop-blur-md border-b border-white/5 text-white py-2 hidden md:block relative z-[60]">
      <Container className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <StatusItem icon={Zap} label="Status" value={status.online ? "Online" : "Offline"} color={status.online ? "text-emerald-500" : "text-rose-500"} />
          <StatusItem icon={Users} label="Jogadores" value={`${status.players_online}/${status.max_players}`} />
          <StatusItem icon={Monitor} label="Versão" value={status.version} />
        </div>

        <button
          type="button"
          onClick={copyIp}
          className="group relative flex items-center gap-3 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">IP:</span>
          <span className="text-[11px] font-black tracking-tight text-white uppercase">
            {copied ? "IP Copiado!" : status.ip}
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-white/40 group-hover:text-white/60 transition-colors" />
          )}
        </button>
      </Container>
    </div>
  );
}

function StatusItem({ icon: Icon, label, value, color = "text-white/90" }: { icon: any, label: string, value: string, color?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className={cn("w-3.5 h-3.5", color)} />
      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-none mb-0.5">{label}</span>
        <span className={cn("text-[11px] font-black uppercase tracking-tight leading-none", color)}>{value}</span>
      </div>
    </div>
  );
}
