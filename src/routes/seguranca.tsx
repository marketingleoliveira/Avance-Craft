import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPageBySlug } from "@/lib/services/pages.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { Container } from "@/components/ui-kit/Container";

export const Route = createFileRoute("/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança e Proteção de Conta — Avance" },
      { name: "description", content: "Dicas de segurança e como proteger sua conta no Avance." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["page", "seguranca"],
      queryFn: () => getPageBySlug({ data: { slug: "seguranca" } }),
    });
  },
  component: SegurancaPage,
});

function SegurancaPage() {
  const { data: page } = useSuspenseQuery({
    queryKey: ["page", "seguranca"],
    queryFn: () => getPageBySlug({ data: { slug: "seguranca" } }),
  });

  if (!page) {
    return (
      <Container className="py-20 text-center">
        <WoodSign>Segurança</WoodSign>
        <StonePanel className="mt-8 p-12 max-w-2xl mx-auto">
          <p className="text-muted-foreground font-pixel text-sm">
            Conteúdo em elaboração pela nossa equipe técnica.
          </p>
        </StonePanel>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <WoodSign>{page.title}</WoodSign>
          <p className="mt-4 text-muted-foreground font-pixel text-[10px] uppercase">
            Última atualização: {new Date(page.updated_at).toLocaleDateString("pt-BR")} | v{page.version}
          </p>
        </div>

        <StonePanel className="p-8 md:p-12">
          <article 
            className="prose prose-stone prose-invert max-w-none 
              prose-headings:font-pixel prose-headings:text-primary prose-headings:uppercase
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </StonePanel>
      </div>
    </Container>
  );
}
