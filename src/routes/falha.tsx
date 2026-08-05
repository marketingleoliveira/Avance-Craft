import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/falha")({
  component: FailurePage,
});

function FailurePage() {
  return (
    <main className="py-20">
      <Container className="max-w-[600px]">
        <StonePanel className="text-center p-10">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <WoodSign subtitle="Não foi possível processar seu pagamento.">
            Falha no Pagamento
          </WoodSign>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Ocorreu um problema ao processar seu pedido. Não se preocupe, nenhuma cobrança foi realizada. Tente novamente ou entre em contato com nosso suporte se o problema persistir.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/loja">
              <PixelButton variant="emerald" className="w-full">Tentar Novamente</PixelButton>
            </Link>
            <Link to="/suporte">
              <PixelButton variant="stone" className="w-full">Pedir Ajuda</PixelButton>
            </Link>
          </div>
        </StonePanel>
      </Container>
    </main>
  );
}
