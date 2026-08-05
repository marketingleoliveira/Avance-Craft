import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getNewsBySlug } from "@/lib/services/content.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Calendar, User, ArrowLeft, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/noticias/$slug")({
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const title = `${(loaderData as any).title} — Habblet Mine`;
    const description = (loaderData as any).excerpt || (loaderData as any).title;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...((loaderData as any).cover_url ? [{ property: "og:image", content: (loaderData as any).cover_url }] : []),
      ],
    };
  },
  loader: async ({ params, context }: any) => {
    return await context.queryClient.ensureQueryData({
      queryKey: ["news", (params as any).slug],
      queryFn: () => getNewsBySlug({ data: { slug: (params as any).slug } }),
    });
  },
  component: NewsArticlePage,
});

function NewsArticlePage() {
  const { slug } = Route.useParams() as { slug: string };
  const { data: article } = useSuspenseQuery({
    queryKey: ["news", slug],
    queryFn: () => getNewsBySlug({ data: { slug } }),
  });

  if (!article) return null;

  const coverUrl = (article as any).cover_url;
  const excerpt = (article as any).excerpt;
  const category = (article as any).category;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        to="/noticias" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-block font-pixel text-[10px] uppercase mb-8 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para notícias
      </Link>

      <article>
        <StonePanel className="p-0 overflow-hidden" bodyClassName="p-0">
          {/* Cover Image */}
          <div className="aspect-video relative w-full overflow-hidden bg-stone-dark/10">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Newspaper className="h-20 w-20" />
              </div>
            )}
            
            {category && (
              <div className="absolute top-6 left-6">
                <span className="bg-emerald-block px-4 py-1.5 font-pixel text-[10px] uppercase text-white pixel-border border-grass-dark shadow-lg">
                  {category.name}
                </span>
              </div>
            )}
          </div>

          {/* Header */}
          <div className="p-8 md:p-12 bg-parchment/95">
            <div className="flex flex-wrap items-center gap-6 text-[10px] text-muted-foreground uppercase font-bold mb-6 border-b-2 border-dirt-dark/5 pb-6">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-block" />
                {article.published_at ? new Date(article.published_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-block" />
                Equipe Habblet Mine
              </span>
            </div>

            <h1 className="font-pixel text-2xl md:text-4xl uppercase text-foreground mb-8 leading-tight">
              {article.title}
            </h1>

            {excerpt && (
              <p className="text-lg text-muted-foreground mb-12 font-medium leading-relaxed italic border-l-4 border-emerald-block/30 pl-6">
                {excerpt}
              </p>
            )}

            {/* Content */}
            <div className="prose prose-stone max-w-none 
              prose-headings:font-pixel prose-headings:uppercase prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg
              prose-strong:text-foreground prose-strong:font-bold
              prose-img:pixel-border prose-img:border-stone-dark/10
              prose-a:text-emerald-block prose-a:no-underline hover:prose-a:underline
              prose-li:text-muted-foreground
            ">
              <div className="whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t-2 border-dirt-dark/5 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-stone-dark/5 pixel-border border-stone-dark/10"></div>
                <div className="h-8 w-8 bg-stone-dark/5 pixel-border border-stone-dark/10"></div>
              </div>
              <Link to="/noticias">
                <Button variant="outline" className="font-pixel text-[9px] uppercase pixel-border">
                  Mais notícias
                </Button>
              </Link>
            </div>
          </div>
        </StonePanel>
      </article>
    </div>
  );
}
