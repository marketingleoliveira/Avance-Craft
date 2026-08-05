import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPageBySlug } from "@/lib/services/pages.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { Container } from "@/components/ui-kit/Container";

export const Route = createFileRoute("/reembolso")({
  head: () => ({
    meta: [
      { title: "Política de Reembolso — Avance" },
      { name: "description", content: "Regras e condições para solicitação de reembolso no Avance." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["page", "reembolso"],
      queryFn: () => getPageBySlug({ data: { slug: "reembolso" } }),
    });
  },
  component: ReembolsoPage,
});

function ReembolsoPage() {
  const { data: page } = useSuspenseQuery({
    queryKey: ["page", "reembolso"],
    queryFn: () => getPageBySlug({ data: { slug: "reembolso" } }),
  });

  if (!page) {
    return (
      <Container className="py-20 text-center">
        <WoodSign>Reembolso</WoodSign>
        <StonePanel className="mt-8 p-12 max-w-2xl mx-auto">
          <p className="text-muted-foreground font-pixel text-sm">
            Política de reembolso em processo de atualização.
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
            Vigência: {new Date(page.updated_at).toLocaleDateString("pt-BR")} | v{page.version}
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
