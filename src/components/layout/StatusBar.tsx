import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { MOCK_SERVER } from "@/data/mock";
import { Container } from "@/components/ui-kit/Container";

const statusLabel: Record<typeof MOCK_SERVER.status, string> = {
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

/** Barra de status — dados mockados, sem contagem real de jogadores. */
export function StatusBar() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_SERVER.ip);
    } catch {
      /* área de transferência indisponível */
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="border-b-4 border-dirt-dark bg-dirt-dark/95 text-parchment">
      <Container className="flex flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between">
        {/* linha 1: status deslizável no mobile */}
        <div className="-mx-1 flex items-center gap-4 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r-2 border-parchment/15 pr-4">
            <span
              className={`h-3 w-3 shrink-0 ${
                MOCK_SERVER.status === "online"
                  ? "bg-emerald-block"
                  : MOCK_SERVER.status === "manutencao"
                    ? "bg-wood"
                    : "bg-destructive"
              }`}
              aria-hidden
            />
            <span className="font-pixel text-[8px] uppercase text-parchment/60">
              Servidor
            </span>
            <span className="text-xs font-bold sm:text-sm">
              {statusLabel[MOCK_SERVER.status]}
            </span>
          </div>
          <StatusChip
            label="Jogadores"
            value={`${MOCK_SERVER.playersOnline}/${MOCK_SERVER.slots}`}
          />
          <StatusChip label="Modo" value="Survival" />
          <StatusChip label="Versão" value="1.21+" />
        </div>

        {/* linha 2: IP sempre visível */}
        <button
          type="button"
          onClick={copyIp}
          aria-label={`Copiar IP ${MOCK_SERVER.ip}`}
          className="pixel-border flex w-full items-center justify-between gap-3 border-grass-dark bg-grass-dark/60 px-3 py-2 text-left transition-colors hover:bg-grass-dark lg:w-auto"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="font-pixel text-[8px] uppercase text-parchment/60">
              IP
            </span>
            <span className="truncate text-xs font-bold sm:text-sm">
              {copied ? "IP copiado!" : MOCK_SERVER.ip}
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
