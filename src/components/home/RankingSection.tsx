import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { cn } from "@/lib/utils";
import { MOCK_RANKING_TABS } from "@/data/mock";

export function RankingSection() {
  const [activeId, setActiveId] = useState(MOCK_RANKING_TABS[0]!.id);
  const active = MOCK_RANKING_TABS.find((tab) => tab.id === activeId) ?? MOCK_RANKING_TABS[0]!;

  return (
    <section className="py-14">
      <Container>
        <WoodSign subtitle="Posições e números são apenas exemplos visuais.">
          Ranking
        </WoodSign>

        <div className="mt-10">
          <div
            role="tablist"
            aria-label="Categorias de ranking"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"
          >
            {MOCK_RANKING_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={tab.id === active.id}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "font-pixel pixel-border shrink-0 px-4 py-2 text-[9px] uppercase transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  tab.id === active.id
                    ? "border-grass-dark bg-emerald-block text-accent-foreground pixel-shadow"
                    : "border-stone-dark bg-stone text-foreground hover:bg-stone/80",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <StonePanel className="mt-4" title={active.label}>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Ranking de {active.label}</caption>
              <thead>
                <tr className="border-b-2 border-dirt-dark/30 text-xs uppercase text-muted-foreground">
                  <th scope="col" className="py-2">#</th>
                  <th scope="col" className="py-2">Jogador</th>
                  <th scope="col" className="py-2">Clã</th>
                  <th scope="col" className="py-2 text-right">{active.metric}</th>
                </tr>
              </thead>
              <tbody>
                {active.rows.map((row) => (
                  <tr key={row.position} className="border-b border-dirt-dark/15">
                    <td className="py-2 font-black text-grass-dark">{row.position}</td>
                    <td className="py-2 font-semibold">{row.player}</td>
                    <td className="py-2 text-muted-foreground">{row.clan}</td>
                    <td className="py-2 text-right font-semibold">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/ranking" className="mt-5 block">
              <PixelButton variant="stone" className="w-full">
                Ranking completo
              </PixelButton>
            </Link>
          </StonePanel>
        </div>
      </Container>
    </section>
  );
}
