import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/pendente")({
  component: PendingPage,
});

function PendingPage() {
  return (
    <main className="py-20">
      <Container className="max-w-[600px]">
        <StonePanel className="text-center p-10">
          <div className="flex justify-center mb-6">
            <Clock className="w-16 h-16 text-yellow-500" />
          </div>
          <WoodSign subtitle="Seu pagamento está sendo processado.">
            Pagamento Pendente
          </WoodSign>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Aguardamos a confirmação do seu pagamento. Assim que for aprovado, seus itens serão entregues automaticamente. Você pode acompanhar o status no seu perfil.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/perfil">
              <PixelButton variant="emerald" className="w-full">Acompanhar Pedido</PixelButton>
            </Link>
            <Link to="/">
              <PixelButton variant="stone" className="w-full">Voltar para a Home</PixelButton>
            </Link>
          </div>
        </StonePanel>
      </Container>
    </main>
  );
}
