import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getNewsBySlug } from "@/lib/services/content.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Calendar, User, ChevronLeft, Newspaper, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/noticias/$slug")({
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title || "Notícia"} — Habblet Mine` },
      { name: "description", content: loaderData?.summary || "" },
      { property: "og:title", content: loaderData?.title },
      { property: "og:description", content: loaderData?.summary },
      { property: "og:type", content: "article" },
      { property: "og:image", content: loaderData?.image_url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ params, context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["news", "slug", params.slug],
      queryFn: () => getNewsBySlug({ data: { slug: params.slug } }),
    });
  },
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const params = Route.useParams();
  const { data: news } = useSuspenseQuery({
    queryKey: ["news", "slug", params.slug],
    queryFn: () => getNewsBySlug({ data: { slug: params.slug } }),
  });

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-pixel text-2xl uppercase mb-4">Notícia não encontrada</h1>
        <Link to="/noticias">
          <Button variant="outline" className="pixel-border font-pixel text-[10px] uppercase">
            Voltar para notícias
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link to="/noticias">
          <Button variant="ghost" size="sm" className="font-pixel text-[9px] uppercase -ml-3">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-block px-3 py-1 font-pixel text-[8px] uppercase text-white pixel-border border-grass-dark">
            Atualização
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(news.published_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        <h1 className="font-pixel text-3xl lg:text-4xl uppercase text-foreground leading-tight mb-6">
          {news.title}
        </h1>
        
        <div className="flex items-center gap-6 py-6 border-y-2 border-stone-dark/5">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-stone-dark/10 rounded-full flex items-center justify-center pixel-border border-stone-dark/20">
              <User className="h-5 w-5 text-stone-dark/40" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Autor</p>
              <p className="font-pixel text-[10px] uppercase">Administração</p>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 pixel-border">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mb-12 aspect-video overflow-hidden rounded-lg pixel-border border-stone-dark/20 shadow-lg">
        {news.image_url ? (
          <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-stone-dark/5 flex items-center justify-center">
            <Newspaper className="h-20 w-20 text-stone-dark/10" />
          </div>
        )}
      </div>

      <StonePanel className="mb-12" bodyClassName="prose prose-stone max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed text-stone-dark/90">
          {news.content}
        </div>
      </StonePanel>

      <footer className="pt-12 border-t-2 border-stone-dark/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start">
          <p className="font-pixel text-[10px] uppercase text-muted-foreground mb-1">Gostou dessa notícia?</p>
          <p className="text-sm font-bold">Compartilhe com seus amigos no Discord!</p>
        </div>
        <Link to="/noticias">
          <Button className="bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark font-pixel text-[10px] uppercase px-8">
            Ver todas as notícias
          </Button>
        </Link>
      </footer>
    </article>
  );
}
