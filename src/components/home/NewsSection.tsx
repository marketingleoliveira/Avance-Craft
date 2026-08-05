import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listRankings } from "@/lib/services/content.functions";

import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

const NEWS_IMAGES: Record<string, string> = { "1": news1, "2": news2, "3": news3 };

const statusLabel: Record<string, string> = {
  online: "Online",
  manutencao: "Em preparação",
  offline: "Offline",
};

function NewsCard({ item }: { item: any }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 group">
      <article className="flex flex-col gap-6 sm:flex-row">
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
          <img
            src={NEWS_IMAGES[item.id] || news1}
            alt={`Ilustração voxel da notícia: ${item.title}`}
            width={640}
            height={640}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            {item.category?.name || "Geral"}
          </span>
          <h3 className="mt-4 text-2xl font-[800] leading-tight tracking-tight group-hover:text-emerald-400 transition-colors">
            {item.title}
          </h3>
          <p className="mt-3 text-stone-400 leading-relaxed line-clamp-2">
            {item.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold uppercase tracking-wider text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-700" />
              {new Date(item.published_at).toLocaleDateString("pt-BR")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-700" />
              por {item.author || "Equipe"}
            </span>
            <Link to="/noticias" className="ml-auto text-emerald-500 hover:text-emerald-400 transition-colors">
              Ler mais →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-dirt-dark/15 py-1.5 last:border-0">
      <span className="text-xs font-bold uppercase text-muted-foreground">{label}</span>
      <span className="text-sm font-extrabold">{value}</span>
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
    <section className="py-24" id="news">
      <Container>
        <div className="space-y-4 mb-16 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-[900] tracking-[-0.03em] uppercase italic">
            Novidades
          </h2>
          <p className="text-stone-400 font-medium text-lg">
            Fique por dentro de tudo que acontece no universo Avance.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="grid gap-6">
            {news.map((item: any) => (
              <NewsCard key={item.id} item={item} />
            ))}
            <div className="flex justify-center">
              <Link to="/noticias">
                <PixelButton variant="stone">Ver todas as notícias</PixelButton>
              </Link>
            </div>
          </div>

          <aside className="grid content-start gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-10 h-full">
              <div className="space-y-6">
                <h3 className="text-xl font-[900] uppercase italic tracking-wider border-b border-white/5 pb-4">Status</h3>
                <ul className="grid gap-4">
                  <SidebarRow label="Servidor" value={statusLabel[statusKey] || "Offline"} />
                  <SidebarRow
                    label="Jogadores"
                    value={`${currentStatus.players_online}/${currentStatus.max_players}`}
                  />
                  <SidebarRow label="Versão" value={currentStatus.version} />
                </ul>
                <div className="bg-stone-900/50 p-4 rounded-xl border border-white/5 font-mono text-center text-emerald-400 text-sm font-bold tracking-widest uppercase">
                  {currentStatus.ip}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-[900] uppercase italic tracking-wider border-b border-white/5 pb-4">Ranking Semanal</h3>
                <ol className="grid gap-4">
                  {rankings.map((row: any) => (
                    <li key={row.minecraft_nickname} className="flex items-center gap-4 group/rank">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">
                        {row.position}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-bold text-stone-200 group-hover/rank:text-white transition-colors">
                        {row.minecraft_nickname}
                      </span>
                      <span className="text-sm font-black text-emerald-500/40">
                        {row.display_value}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-[900] uppercase italic tracking-wider border-b border-white/5 pb-4">Comunidade</h3>
                <p className="text-stone-400 font-medium leading-relaxed">
                  Junte-se a milhares de jogadores em nosso Discord oficial.
                </p>
                <a href="https://discord.gg/avance" target="_blank" rel="noopener noreferrer" className="block">
                  <button className="w-full py-4 bg-white text-stone-950 font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all active:scale-95">
                    Entrar no Discord
                  </button>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
