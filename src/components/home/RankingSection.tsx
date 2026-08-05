import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listRankings } from "@/lib/services/content.functions";
import { cn } from "@/lib/utils";

const RANKING_TABS = [
  { id: "ricos", label: "Mais Ricos", metric: "Saldo" },
  { id: "clãs", label: "Melhores Clãs", metric: "Nível" },
  { id: "vips", label: "Top VIPs", metric: "Tempo" },
];

export function RankingSection() {
  const [activeTab, setActiveTab] = useState(RANKING_TABS[0]!);
  
  const { data: rankingData } = useSuspenseQuery({
    queryKey: ["rankings", activeTab.id, "weekly", 5],
    queryFn: () => listRankings({ data: { category: activeTab.id, period: "weekly", limit: 5 } }),
  });

  return (
    <section className="py-14">
      <Container>
        <WoodSign subtitle="Os melhores jogadores do servidor.">Ranking Global</WoodSign>

        <div className="mt-10">
          <div
            role="tablist"
            aria-label="Categorias de ranking"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"
          >
            {RANKING_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={tab.id === activeTab.id}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "font-pixel pixel-border shrink-0 px-4 py-2 text-[9px] uppercase transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  tab.id === activeTab.id
                    ? "border-grass-dark bg-emerald-block text-accent-foreground pixel-shadow"
                    : "border-stone-dark bg-stone text-foreground hover:bg-stone/80",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <StonePanel className="mt-4" title={activeTab.label}>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Ranking de {activeTab.label}</caption>
              <thead>
                <tr className="border-b-2 border-dirt-dark/30 text-xs uppercase text-muted-foreground">
                  <th scope="col" className="py-2">#</th>
                  <th scope="col" className="py-2">Jogador</th>
                  <th scope="col" className="py-2 text-right">{activeTab.metric}</th>
                </tr>
              </thead>
              <tbody>
                {rankingData.map((row: any) => (
                  <tr key={row.minecraft_nickname} className="border-b border-dirt-dark/15">
                    <td className="py-2 font-black text-grass-dark">{row.position}</td>
                    <td className="py-2 font-semibold">{row.minecraft_nickname}</td>
                    <td className="py-2 text-right font-semibold">{row.display_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5">
              <Link to="/ranking">
                <PixelButton variant="stone" className="w-full">
                  Ranking completo
                </PixelButton>
              </Link>
            </div>
          </StonePanel>
        </div>
      </Container>
    </section>
  );
}
