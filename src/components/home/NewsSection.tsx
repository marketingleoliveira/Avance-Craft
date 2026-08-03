import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import {
  MOCK_NEWS,
  MOCK_SERVER,
  MOCK_LAST_PLAYERS,
  MOCK_EVENTS,
  MOCK_RANKING_TABS,
} from "@/data/mock";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

const NEWS_IMAGES: Record<string, string> = { "1": news1, "2": news2, "3": news3 };

const statusLabel: Record<typeof MOCK_SERVER.status, string> = {
  online: "Online",
  manutencao: "Em preparação",
  offline: "Offline",
};

function NewsCard({ item }: { item: (typeof MOCK_NEWS)[number] }) {
  return (
    <StonePanel bodyClassName="p-3 sm:p-4">
      <article className="flex flex-col gap-4 sm:flex-row">
        <img
          src={NEWS_IMAGES[item.id]}
          alt={`Ilustração voxel da notícia: ${item.title}`}
          width={640}
          height={640}
          loading="lazy"
          className="pixel-border border-dirt-dark h-32 w-full shrink-0 object-cover sm:h-32 sm:w-32"
        />
        <div className="min-w-0">
          <span className="font-pixel pixel-border border-grass-dark bg-grass px-2 py-1 text-[8px] uppercase text-primary-foreground">
            {item.category}
          </span>
          <h3 className="mt-3 text-lg font-extrabold leading-tight">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase text-dirt">
            <span>{item.date}</span>
            <span aria-hidden>•</span>
            <span>por {item.author}</span>
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

export function NewsSection() {
  const weekly = MOCK_RANKING_TABS[0]!.rows.slice(0, 3);

  return (
    <section className="py-14">
      <Container>
        <WoodSign subtitle="Conteúdo de exemplo até a integração com o backend.">
          Novidades
        </WoodSign>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="grid gap-6">
            {MOCK_NEWS.map((item) => (
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
                <SidebarRow label="Servidor" value={statusLabel[MOCK_SERVER.status]} />
                <SidebarRow
                  label="Jogadores"
                  value={`${MOCK_SERVER.playersOnline}/${MOCK_SERVER.slots}`}
                />
                <SidebarRow label="Modo" value="Survival" />
                <SidebarRow label="Versão" value="1.21+" />
              </ul>
              <p className="mt-3 break-all bg-dirt-dark/10 p-2 text-sm font-bold">
                {MOCK_SERVER.ip}
              </p>
            </StonePanel>

            <StonePanel title="Últimos jogadores">
              <ul className="grid gap-2 text-sm">
                {MOCK_LAST_PLAYERS.map((player) => (
                  <li key={player} className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 shrink-0 bg-stone-dark" aria-hidden />
                    {player}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Lista ilustrativa — ninguém está conectado ainda.
              </p>
            </StonePanel>

            <StonePanel title="Ranking semanal">
              <ol className="grid gap-2 text-sm">
                {weekly.map((row) => (
                  <li key={row.position} className="flex items-center gap-3">
                    <span className="font-pixel text-[10px] text-grass-dark">
                      {row.position}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {row.player}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.score}</span>
                  </li>
                ))}
              </ol>
            </StonePanel>

            <StonePanel title="Próximos eventos">
              <ul className="grid gap-3 text-sm">
                {MOCK_EVENTS.map((event) => (
                  <li key={event.id}>
                    <p className="font-extrabold">{event.title}</p>
                    <p className="text-xs uppercase text-muted-foreground">{event.date}</p>
                  </li>
                ))}
              </ul>
              <a href={MOCK_SERVER.discord} className="mt-4 block">
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
