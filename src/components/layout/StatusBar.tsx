import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Container } from "@/components/ui-kit/Container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getServerStatus } from "@/lib/services/content.functions";

const statusLabel: Record<string, string> = {
  online: "Online",
  manutencao: "Em preparação",
  offline: "Offline",
};

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r-2 border-parchment/15 pr-4 last:border-r-0 last:pr-0">
      <span className="font-pixel text-[8px] uppercase text-parchment/60">
        {label}
      </span>
      <span className="text-xs font-bold text-parchment sm:text-sm">{value}</span>
    </div>
  );
}

export function StatusBar() {
  const { data: status } = useSuspenseQuery({
    queryKey: ["server-status"],
    queryFn: () => getServerStatus(),
  });

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
    <div className="border-b-4 border-dirt-dark bg-dirt-dark/95 text-parchment">
      <Container className="flex flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex items-center gap-4 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r-2 border-parchment/15 pr-4">
            <span
              className={`h-3 w-3 shrink-0 ${
                status.status === "online"
                  ? "bg-emerald-block"
                  : status.status === "manutencao"
                    ? "bg-wood"
                    : "bg-destructive"
              }`}
              aria-hidden
            />
            <span className="font-pixel text-[8px] uppercase text-parchment/60">
              Servidor
            </span>
            <span className="text-xs font-bold sm:text-sm">
              {statusLabel[status.status] || "Offline"}
            </span>
          </div>
          <StatusChip
            label="Jogadores"
            value={`${status.players_online}/${status.max_slots}`}
          />
          <StatusChip label="Modo" value="Survival" />
          <StatusChip label="Versão" value={status.version} />
        </div>

        <button
          type="button"
          onClick={copyIp}
          aria-label={`Copiar IP ${status.ip}`}
          className="pixel-border flex w-full items-center justify-between gap-3 border-grass-dark bg-grass-dark/60 px-3 py-2 text-left transition-colors hover:bg-grass-dark lg:w-auto"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="font-pixel text-[8px] uppercase text-parchment/60">
              IP
            </span>
            <span className="truncate text-xs font-bold sm:text-sm">
              {copied ? "IP copiado!" : status.ip}
            </span>
          </span>
          {copied ? (
            <Check className="h-4 w-4 shrink-0 text-emerald-block" aria-hidden />
          ) : (
            <Copy className="h-4 w-4 shrink-0" aria-hidden />
          )}
        </button>
      </Container>
    </div>
  );
}
