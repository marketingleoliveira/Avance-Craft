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
    <StonePanel bodyClassName="p-3 sm:p-4">
      <article className="flex flex-col gap-4 sm:flex-row">
        <img
          src={NEWS_IMAGES[item.id] || news1}
          alt={`Ilustração voxel da notícia: ${item.title}`}
          width={640}
          height={640}
          loading="lazy"
          className="pixel-border border-dirt-dark h-32 w-full shrink-0 object-cover sm:h-32 sm:w-32"
        />
        <div className="min-w-0">
          <span className="font-pixel pixel-border border-grass-dark bg-grass px-2 py-1 text-[8px] uppercase text-primary-foreground">
            {item.category?.name || "Geral"}
          </span>
          <h3 className="mt-3 text-lg font-extrabold leading-tight">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase text-dirt">
            <span>{new Date(item.published_at).toLocaleDateString("pt-BR")}</span>
            <span aria-hidden>•</span>
            <span>por {item.author || "Equipe"}</span>
          </div>
          <Link to="/noticias" className="mt-4 inline-block">
            <PixelButton variant="wood">Leia mais</PixelButton>
          </Link>
        </div>
      </article>
    </StonePanel>
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
  ip: "jogar.habbletmine.com.br"
};

export function NewsSection({ news, status }: { news: any[]; status: any }) {


  const { data: rankings } = useSuspenseQuery({
    queryKey: ["rankings", "ricos", "weekly", 3],
    queryFn: () => listRankings({ data: { category: "ricos", period: "weekly", limit: 3 } }),
  });

  const status = serverStatus ?? DEFAULT_STATUS;
  const statusKey = status.online ? "online" : "offline";

  return (
    <section className="py-14">
      <Container>
        <WoodSign subtitle="Fique por dentro das novidades.">
          Novidades
        </WoodSign>

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
            <StonePanel title="Status do servidor">
              <ul className="grid">
                <SidebarRow label="Servidor" value={statusLabel[statusKey] || "Offline"} />
                <SidebarRow
                  label="Jogadores"
                  value={`${status.players_online}/${status.max_players}`}
                />
                <SidebarRow label="Modo" value="Survival" />
                <SidebarRow label="Versão" value={status.version} />
              </ul>
              <p className="mt-3 break-all bg-dirt-dark/10 p-2 text-sm font-bold">
                {status.ip}
              </p>
            </StonePanel>

            <StonePanel title="Ranking semanal">
              <ol className="grid gap-2 text-sm">
                {rankings.map((row: any) => (
                  <li key={row.minecraft_nickname} className="flex items-center gap-3">
                    <span className="font-pixel text-[10px] text-grass-dark">
                      {row.position}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {row.minecraft_nickname}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.display_value}</span>
                  </li>
                ))}
              </ol>
            </StonePanel>

            <StonePanel title="Comunidade">
              <p className="text-sm text-muted-foreground">
                Junte-se a milhares de jogadores em nosso Discord oficial.
              </p>
              <a href="https://discord.gg/habbletmine" target="_blank" rel="noopener noreferrer" className="mt-4 block">
                <PixelButton variant="emerald" className="w-full">
                  Entrar no Discord
                </PixelButton>
              </a>
            </StonePanel>
          </aside>
        </div>
      </Container>
    </section>
  );
}
