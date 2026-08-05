import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollReveal } from "@/components/ui-kit/Motion";

type Props = {
  title: string;
  description: string;
};

/** Página em construção — apenas estrutura, sem funcionalidades simuladas. */
export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-14">
        <Container>
          <WoodSign>{title}</WoodSign>
          <div className="mx-auto mt-10 max-w-2xl">
            <StonePanel title="Em construção">
              <p className="text-sm leading-relaxed">{description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Esta página está sendo atualizada para a nova identidade visual Avance Prime.
              </p>
            </StonePanel>
          </div>
        </Container>
      </main>
      <ScrollReveal>
        <SiteFooter />
      </ScrollReveal>
    </div>
  );
}
