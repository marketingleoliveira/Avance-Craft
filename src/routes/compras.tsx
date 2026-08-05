import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPageBySlug } from "@/lib/services/pages.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { Container } from "@/components/ui-kit/Container";

export const Route = createFileRoute("/compras")({
  head: () => ({
    meta: [
      { title: "Como Comprar — Avance" },
      { name: "description", content: "Guia passo a passo de como adquirir VIPs e pacotes na nossa loja." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["page", "compras"],
      queryFn: () => getPageBySlug({ data: { slug: "compras" } }),
    });
  },
  component: ComprasPage,
});

function ComprasPage() {
  const { data: page } = useSuspenseQuery({
    queryKey: ["page", "compras"],
    queryFn: () => getPageBySlug({ data: { slug: "compras" } }),
  });

  if (!page) {
    return (
      <Container className="py-20 text-center">
        <WoodSign>Guia de Compras</WoodSign>
        <StonePanel className="mt-8 p-12 max-w-2xl mx-auto">
          <p className="text-muted-foreground font-pixel text-sm">
            O guia de compras está sendo atualizado.
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
