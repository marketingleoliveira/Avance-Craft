import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listRankings } from "@/lib/services/content.functions";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RANKING_TABS = [
  { id: "ricos", label: "Mais Ricos", metric: "Saldo", icon: Trophy },
  { id: "clãs", label: "Melhores Clãs", metric: "Nível", icon: Crown },
  { id: "vips", label: "Top VIPs", metric: "Tempo", icon: Medal },
];

export function RankingSection() {
  const [activeTab, setActiveTab] = useState(RANKING_TABS[0]!);
  
  const { data: rankingData } = useSuspenseQuery({
    queryKey: ["rankings", activeTab.id, "weekly", 5],
    queryFn: () => listRankings({ data: { category: activeTab.id, period: "weekly", limit: 5 } }),
  });

  return (
    <section className="relative overflow-hidden" id="ranking">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px]">
              <Trophy className="w-3 h-3" />
              Lendas do servidor
            </div>
            <h2 className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white">
              Hall da <span className="text-emerald-500">Fama</span>
            </h2>
            <p className="text-stone-400 font-medium text-lg max-w-xl">
              Os jogadores dominando o Avance.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-12 items-start">
          {/* Tabs Sidebar */}
          <div className="flex flex-col gap-4">
            {RANKING_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "group flex items-center justify-between p-6 rounded-2xl transition-all border",
                    isActive 
                      ? "bg-emerald-500 border-emerald-500 text-stone-950 shadow-xl shadow-emerald-500/20" 
                      : "bg-white/[0.02] border-white/5 text-stone-400 hover:bg-white/[0.04] hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={cn("w-6 h-6", isActive ? "text-stone-950" : "text-emerald-500")} />
                    <span className="font-[900] uppercase italic tracking-wider text-sm">{tab.label}</span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "translate-x-1" : "opacity-30 group-hover:translate-x-1")} />
                </button>
              );
            })}
          </div>

          {/* Ranking Table wrapped in UI Card */}
          <Card className="p-8">
            <AnimatePresence mode="wait">
              <motion.table 
                key={activeTab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full text-left"
              >
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 border-b border-white/5">
                    <th className="pb-6">Posição</th>
                    <th className="pb-6">Jogador</th>
                    <th className="pb-6 text-right">{activeTab.metric}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {rankingData.map((row: any, i: number) => (
                    <motion.tr 
                      key={row.minecraft_nickname}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group/row hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-6 pr-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                          i === 0 ? "bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/30" : 
                          i === 1 ? "bg-stone-200 text-stone-950" :
                          i === 2 ? "bg-stone-700 text-white" : "bg-white/5 text-stone-400"
                        )}>
                          {row.position}
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={`https://mc-heads.net/avatar/${row.minecraft_nickname}/32`}
                            alt={row.minecraft_nickname}
                            className="w-8 h-8 rounded-lg shadow-lg group-hover/row:scale-110 transition-transform"
                          />
                          <span className="font-[800] text-stone-100 group-hover/row:text-emerald-400 transition-colors uppercase tracking-tight">
                            {row.minecraft_nickname}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <span className="font-mono font-bold text-stone-400">
                          {row.display_value}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </AnimatePresence>
            
            <div className="mt-10 flex justify-center">
              <Button asChild variant="outline" className="w-full sm:w-auto px-12 py-6 rounded-2xl">
                <Link to="/ranking">Ver Ranking Completo</Link>
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

