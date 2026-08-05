import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listRankings } from "@/lib/services/content.functions";
import { Newspaper, ChevronRight, Activity, Trophy, Users, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

const NEWS_IMAGES: Record<string, string> = { "1": news1, "2": news2, "3": news3 };

const statusLabel: Record<string, string> = {
  online: "Online",
  manutencao: "Preparando",
  offline: "Offline",
};

function NewsCard({ item }: { item: any }) {
  return (
    <Link to="/noticias" className="group block">
      <article className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl transition-all hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1">
        <div className="flex flex-col gap-8 sm:flex-row items-center">
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-40 border border-white/5">
            <img
              src={NEWS_IMAGES[item.id] || news1}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500 text-stone-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                {item.category?.name || "Geral"}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                {new Date(item.published_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
            
            <h3 className="text-2xl font-[900] leading-tight tracking-tight text-white group-hover:text-emerald-400 transition-colors uppercase italic">
              {item.title}
            </h3>
            
            <p className="text-stone-400 font-medium leading-relaxed line-clamp-2">
              {item.excerpt}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                <User className="w-3 h-3 text-emerald-500" />
                Por {item.author || "Equipe Avance"}
              </div>
              <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group-hover:gap-3 transition-all">
                Ler Matéria <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SidebarRow({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <li className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</span>
      </div>
      <span className="text-sm font-[900] text-white italic uppercase">{value}</span>
    </li>
  );
}

const DEFAULT_STATUS = {
  online: true,
  players_online: 0,
  max_players: 100,
  version: "1.21+",
  ip: "jogar.avance.com.br"
};

export function NewsSection({ news, status }: { news: any[]; status: any }) {
  const { data: rankings } = useSuspenseQuery({
    queryKey: ["rankings", "ricos", "weekly", 3],
    queryFn: () => listRankings({ data: { category: "ricos", period: "weekly", limit: 3 } }),
  });

  const currentStatus = status ?? DEFAULT_STATUS;
  const statusKey = currentStatus.online ? "online" : "offline";

  return (
    <section className="relative py-24 bg-stone-950 overflow-hidden" id="news">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px]">
              <Newspaper className="w-3 h-3" />
              Diário do Explorador
            </div>
            <h2 className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic text-white">
              Últimas <span className="text-emerald-500">Notícias</span>
            </h2>
            <p className="text-stone-400 font-medium text-lg max-w-xl">
              Fique por dentro das atualizações, eventos e anúncios do Avance.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex text-emerald-500 hover:text-white hover:bg-emerald-500/10">
            <Link to="/noticias" className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
              Ver Todas <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr]">
          {/* Main Feed */}
          <div className="space-y-6">
            {news.map((item: any) => (
              <NewsCard key={item.id} item={item} />
            ))}
            <div className="md:hidden mt-8">
              <Button asChild className="w-full h-16 rounded-2xl">
                <Link to="/noticias">Ver Todas as Notícias</Link>
              </Button>
            </div>
          </div>

          {/* Technical Sidebar */}
          <aside className="space-y-8">
            {/* Server Status Widget */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
              <h3 className="text-xl font-[900] uppercase italic tracking-wider text-white mb-6 flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-500" />
                Live Status
              </h3>
              <ul className="space-y-3 mb-6">
                <SidebarRow label="Status" value={statusLabel[statusKey] || "Offline"} icon={Activity} />
                <SidebarRow label="Jogadores" value={`${currentStatus.players_online}/${currentStatus.max_players}`} icon={Users} />
                <SidebarRow label="Versão" value={currentStatus.version} icon={Calendar} />
              </ul>
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center group cursor-pointer active:scale-95 transition-all">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">IP de Conexão</span>
                <span className="text-lg font-[900] text-white uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
                  {currentStatus.ip}
                </span>
              </div>
            </div>

            {/* Top Players Widget */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
              <h3 className="text-xl font-[900] uppercase italic tracking-wider text-white mb-6 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-emerald-500" />
                Top Fortune
              </h3>
              <ol className="space-y-4">
                {rankings.map((row: any, i: number) => (
                  <li key={row.minecraft_nickname} className="flex items-center gap-4 group/item">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
                      i === 0 ? "bg-emerald-500 text-stone-950" : "bg-white/5 text-stone-400"
                    )}>
                      {row.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-100 uppercase tracking-tight truncate group-hover/item:text-emerald-400 transition-colors">
                        {row.minecraft_nickname}
                      </p>
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest italic">
                        {row.display_value}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
