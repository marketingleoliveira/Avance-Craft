import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listPublishedNews } from "@/lib/services/content.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";

const title = "Notícias — Habblet Mine";
const description = "Atualizações, eventos e novidades do servidor Habblet Mine.";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["news", "published", 12],
      queryFn: () => listPublishedNews({ data: { limit: 12 } }),
    });
  },
  component: NewsListPage,
});

function NewsListPage() {
  const { data: news } = useSuspenseQuery({
    queryKey: ["news", "published", 12],
    queryFn: () => listPublishedNews({ data: { limit: 12 } }),
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-12 text-center">
        <h1 className="font-pixel text-3xl uppercase text-foreground mb-4">Notícias & Novidades</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Fique por dentro de tudo o que acontece no universo do Habblet Mine.
        </p>
      </header>

      {news.length === 0 ? (
        <StonePanel className="text-center py-20">
          <Newspaper className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="font-pixel text-sm uppercase text-muted-foreground">Nenhuma notícia publicada ainda.</p>
        </StonePanel>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Link 
              key={item.id} 
              to={`/noticias/${item.slug}`} 
              className="group flex flex-col h-full"
            >
              <StonePanel className="flex-1 flex flex-col p-0 overflow-hidden" bodyClassName="p-0 flex flex-col flex-1">
                <div className="aspect-video overflow-hidden relative">
                  {(item as any).image_url || (item as any).cover_url ? (
                    <img 
                      src={(item as any).image_url || (item as any).cover_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-dark/10 flex items-center justify-center">
                      <Newspaper className="h-10 w-10 text-stone-dark/20" />
                    </div>
                  )}
                  {item.category && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-emerald-block px-3 py-1 font-pixel text-[8px] uppercase text-white pixel-border border-grass-dark shadow-sm">
                        {item.category.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1 bg-parchment/95">
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.published_at ? new Date(item.published_at).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  
                  <h3 className="font-pixel text-sm uppercase text-foreground mb-3 line-clamp-2 group-hover:text-emerald-block transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {(item as any).summary || (item as any).excerpt}
                  </p>
                  
                  <div className="flex items-center text-emerald-block font-pixel text-[9px] uppercase mt-auto group-hover:translate-x-1 transition-transform">
                    Leia mais <ArrowRight className="ml-2 h-3 w-3" />
                  </div>
                </div>
              </StonePanel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
