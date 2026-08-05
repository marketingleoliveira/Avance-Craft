import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sucesso")({
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <main className="py-20">
      <Container maxW="600px">
        <StonePanel className="text-center p-10">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-block" />
          </div>
          <WoodSign subtitle="Seu pedido foi processado com sucesso!">
            Pagamento Aprovado
          </WoodSign>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Obrigado por apoiar o Habblet Mine! Seus itens serão entregues automaticamente no servidor em alguns minutos. Certifique-se de estar online para receber.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/perfil">
              <PixelButton variant="emerald" className="w-full">Ver meus pedidos</PixelButton>
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
