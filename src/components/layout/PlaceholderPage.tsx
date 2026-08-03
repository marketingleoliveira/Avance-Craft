import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";

type Props = {
  title: string;
  description: string;
};

/** Página em construção — apenas estrutura, sem funcionalidades simuladas. */
export function PlaceholderPage({ title, description }: Props) {
  return (
    <main className="py-14">
      <Container>
        <WoodSign>{title}</WoodSign>
        <div className="mx-auto mt-10 max-w-2xl">
          <StonePanel title="Em construção">
            <p className="text-sm leading-relaxed">{description}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Esta página ainda não foi desenvolvida visualmente. Nesta etapa apenas a
              página inicial está finalizada.
            </p>
          </StonePanel>
        </div>
      </Container>
    </main>
  );
}
