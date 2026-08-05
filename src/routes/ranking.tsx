import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { listRankings } from "@/lib/services/content.functions";
import { cn } from "@/lib/utils";
import { Search, Trophy, Timer, Sword, Scroll, Vote } from "lucide-react";

const RANKING_TABS = [
  { id: "ricos", label: "Mais Ricos", metric: "Saldo", icon: Trophy },
  { id: "tempo", label: "Tempo Online", metric: "Horas", icon: Timer },
  { id: "abates", label: "Abates", metric: "Kills", icon: Sword },
  { id: "missoes", label: "Missões", metric: "Concluídas", icon: Scroll },
  { id: "votos", label: "Votos", metric: "Votos", icon: Vote },
];

export const Route = createFileRoute("/ranking")({
  head: () => {
    const title = "Ranking Global — Avance";
    const description = "Confira os melhores jogadores do Avance em economia, tempo online, PvP e muito mais.";
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
  component: RankingPage,
});

function RankingPage() {
  const [activeTab, setActiveTab] = useState(RANKING_TABS[0]!);
  const [search, setSearch] = useState("");

  const { data: rankingData } = useSuspenseQuery({
    queryKey: ["rankings", activeTab.id, "all"],
    queryFn: () => listRankings({ data: { category: activeTab.id, period: "weekly", limit: 50 } }),
  });

  const filteredData = rankingData.filter(row => 
    row.minecraft_nickname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen py-20">
      <Container>
        <WoodSign subtitle="Os jogadores mais lendários do nosso universo.">
          Ranking Global
        </WoodSign>

        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {/* Sidebar de Abas */}
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-2">
              {RANKING_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearch("");
                  }}
                  className={cn(
                    "font-pixel pixel-border flex items-center gap-3 px-4 py-3 text-[10px] uppercase transition-all",
                    activeTab.id === tab.id
                      ? "border-grass-dark bg-emerald-block text-accent-foreground pixel-shadow translate-x-1"
                      : "border-stone-dark bg-stone text-foreground hover:bg-stone/80"
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <StonePanel title={activeTab.label}>
              {/* Barra de Busca */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar nickname..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pixel-border w-full border-dirt-dark/30 bg-dirt/20 py-2 pl-10 pr-4 font-pixel text-[10px] uppercase focus:outline-none focus:ring-2 focus:ring-emerald-block/50"
                />
              </div>

              {rankingData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Nenhum dado encontrado para esta categoria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-dirt-dark/30 text-xs uppercase text-muted-foreground">
                        <th className="pb-3 pr-4">Posição</th>
                        <th className="pb-3">Jogador</th>
                        <th className="pb-3 text-right">{activeTab.metric}</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold">
                      {filteredData.map((row, index) => (
                        <tr 
                          key={row.id} 
                          className={cn(
                            "group border-b border-dirt-dark/10 transition-colors hover:bg-dirt-dark/5",
                            index < 3 && "text-grass-dark"
                          )}
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "flex h-8 w-8 items-center justify-center font-pixel text-xs",
                                index === 0 && "pixel-border border-yellow-500 bg-yellow-400 text-yellow-900",
                                index === 1 && "pixel-border border-gray-400 bg-gray-300 text-gray-800",
                                index === 2 && "pixel-border border-amber-700 bg-amber-600 text-amber-50"
                              )}>
                                {row.position}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="pixel-border h-10 w-10 border-dirt-dark/20 bg-dirt/10 p-1">
                                <img 
                                  src={`https://minotar.net/helm/${row.minecraft_nickname}/40`} 
                                  alt={row.minecraft_nickname}
                                  className="h-full w-full rendering-pixelated"
                                />
                              </div>
                              <span>{row.minecraft_nickname}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right font-pixel text-[11px]">
                            {row.display_value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredData.length === 0 && search && (
                    <div className="py-10 text-center text-muted-foreground">
                      Nenhum jogador encontrado com "{search}"
                    </div>
                  )}
                </div>
              )}

              {rankingData[0]?.updated_at && (
                <div className="mt-8 flex items-center justify-end gap-2 text-[10px] uppercase text-muted-foreground font-pixel">
                  <Timer className="h-3 w-3" />
                  Sincronizado em: {new Date(rankingData[0].updated_at).toLocaleString('pt-BR')}
                </div>
              )}
            </StonePanel>
          </div>
        </div>
      </Container>
    </main>
  );
}

