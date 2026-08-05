import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPageBySlug } from "@/lib/services/pages.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { listPublicSettings } from "@/lib/services/content.functions";

export const Route = createFileRoute("/termos")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["page", "termos"],
      queryFn: () => getPageBySlug({ data: { slug: "termos" } }),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["site-settings"],
      queryFn: () => listPublicSettings(),
    });
  },
  component: PageLayout,
});

function PageLayout() {
  const { data: page } = useSuspenseQuery({
    queryKey: ["page", "termos"],
    queryFn: () => getPageBySlug({ data: { slug: "termos" } }),
  });

  const { data: settings } = useSuspenseQuery({
    queryKey: ["site-settings"],
    queryFn: () => listPublicSettings(),
  });

  if (!page) {
    return (
      <Container className="py-20 text-center">
        <WoodSign>404</WoodSign>
        <p className="mt-4 text-muted-foreground">Página não encontrada.</p>
      </Container>
    );
  }

  return (
    <Container className="py-12 max-w-4xl">
      <StonePanel title={page.title} className="mb-8">
        <div className="prose prose-stone prose-invert max-w-none text-foreground">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
          
          <div className="mt-12 pt-8 border-t border-black/10 text-xs text-muted-foreground space-y-2">
            <p>Versão: {page.version} | Última atualização: {format(new Date(page.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p className="italic">Este documento não substitui revisão jurídica. Os termos aqui apresentados são diretrizes operacionais do Habblet Mine.</p>
            <div className="mt-4 p-4 bg-black/5 rounded pixel-border border-black/10">
              <p><strong>Identificação:</strong> {settings.business_legal_name || "Pendente"} | CNPJ: {settings.business_cnpj || "Pendente"}</p>
              <p><strong>Contato:</strong> {settings.business_email || "Pendente"} | {settings.business_address || "Pendente"}</p>
            </div>
          </div>
        </div>
      </StonePanel>
    </Container>
  );
}
