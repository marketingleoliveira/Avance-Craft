import { MOCK_SERVER } from "@/data/mock";
import { Container } from "@/components/ui-kit/Container";

const statusLabel: Record<typeof MOCK_SERVER.status, string> = {
  online: "Servidor online",
  manutencao: "Em preparação",
  offline: "Offline",
};

/** Barra de status — dados mockados, sem contagem real de jogadores. */
export function StatusBar() {
  return (
    <div className="bg-dirt-dark text-parchment">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 shrink-0 bg-emerald-block" aria-hidden />
          <span className="font-pixel truncate text-[9px] uppercase">
            {statusLabel[MOCK_SERVER.status]}
          </span>
        </div>
        <p className="text-xs font-semibold sm:text-sm">
          IP: <span className="text-emerald-block">{MOCK_SERVER.ip}</span>
        </p>
        <p className="hidden text-xs font-semibold sm:block">
          Versão: {MOCK_SERVER.version}
        </p>
      </Container>
    </div>
  );
}
