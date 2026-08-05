import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getHomeData } from "@/lib/services/content.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { Container } from "@/components/ui-kit/Container";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { PixelButton } from "@/components/ui-kit/PixelButton";


export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Habblet Mine" },
      { name: "description", content: "Entre em contato com a equipe do Habblet Mine." },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const { data: homeData } = useQuery({
    queryKey: ["home-data"],
    queryFn: () => getHomeData(),
  });

  const settings = homeData?.settings || {};

  return (
    <Container className="py-20">
      <div className="max-w-4xl mx-auto text-center">
        <WoodSign className="mb-8">Central de Contato</WoodSign>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <StonePanel className="p-8 flex flex-col items-center">
            <div className="bg-primary/20 p-4 rounded-none mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-pixel text-sm mb-2">E-mail</h3>
            <p className="text-muted-foreground text-xs">{settings['business_email'] || "contato@habbletmine.com.br"}</p>
          </StonePanel>

          <StonePanel className="p-8 flex flex-col items-center">
            <div className="bg-emerald-500/20 p-4 rounded-none mb-4">
              <MessageCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-pixel text-sm mb-2">Discord</h3>
            <p className="text-muted-foreground text-xs">discord.gg/habbletmine</p>
          </StonePanel>

          <StonePanel className="p-8 flex flex-col items-center">
            <div className="bg-amber-500/20 p-4 rounded-none mb-4">
              <MapPin className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-pixel text-sm mb-2">Endereço</h3>
            <p className="text-muted-foreground text-[10px] leading-tight">
              {settings['business_address'] || "Consulte os Termos de Uso"}
            </p>
          </StonePanel>
        </div>

        <StonePanel className="mt-12 p-8 text-left border-l-4 border-l-primary">
          <h2 className="font-pixel text-sm mb-4">Ainda precisa de ajuda?</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Se você já é um jogador, recomendamos abrir um ticket de suporte em nosso painel para um atendimento mais rápido e personalizado.
          </p>
          <div className="flex gap-4">
            <PixelButton variant="emerald">ABRIR TICKET</PixelButton>
          </div>
        </StonePanel>
      </div>
    </Container>
  );
}
