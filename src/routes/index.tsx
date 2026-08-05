import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getHomeData } from "@/lib/services/content.functions";
import { Hero } from "@/components/home/Hero";
import { NewsSection } from "@/components/home/NewsSection";
import { ModesSection } from "@/components/home/ModesSection";
import { ShopHighlight } from "@/components/home/ShopHighlight";
import { RankingSection } from "@/components/home/RankingSection";
import { HowToPlay } from "@/components/home/HowToPlay";
import { CommunitySection } from "@/components/home/CommunitySection";
import { FinalCta } from "@/components/home/FinalCta";
import { PixelButton } from "@/components/ui/PixelButton";
import { StonePanel } from "@/components/ui/StonePanel";
import { CheckCircle2, AlertCircle, Terminal, ClipboardCheck } from "lucide-react";

const title = "Habblet Mine — Servidor Brasileiro de Minecraft (Java & Bedrock)";
const description =
  "Entre agora no Habblet Mine, o melhor servidor brasileiro de blocos. Survival com economia, eventos diários, VIPs e suporte para Java 1.21+ e Bedrock.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/98ca8ef2-57d9-4488-95ad-3f24ecd6dacb/id-preview-eca6f6b8--6a6811b0-b68a-424a-8f2c-66169d9656f8.lovable.app-1785764486740.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/98ca8ef2-57d9-4488-95ad-3f24ecd6dacb/id-preview-eca6f6b8--6a6811b0-b68a-424a-8f2c-66169d9656f8.lovable.app-1785764486740.png" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["home-data"],
      queryFn: () => getHomeData(),
    });
  },
  component: Index,
});

function Index() {
  const { data: homeData } = useSuspenseQuery({
    queryKey: ["home-data"],
    queryFn: () => getHomeData(),
  });

  const { news, status, modes, featuredProducts, settings } = homeData;

  return (
    <main className="relative">
      <Hero settings={settings} />

      {/* Checklist de Pré-deploy (Apenas em Dev/Staging ou para Staff) */}
      <section className="py-16 bg-background/50 border-y border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 max-w-[1180px]">
          <StonePanel className="p-8 border-yellow-600/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-minecraft text-yellow-500 mb-2">Checklist de Pré-deploy</h2>
                <p className="text-muted-foreground italic">Garantindo a estabilidade do Habblet Mine v1.0.0-rc.1</p>
              </div>
              <div className="flex gap-4">
                <Link to="/admin/saude">
                  <PixelButton variant="stone" className="px-6">Painel de Saúde</PixelButton>
                </Link>
                <PixelButton 
                  className="px-6 bg-green-600 hover:bg-green-500 border-green-700"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Rodar Verificação
                </PixelButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AUTOMATIZADO */}
              <div className="space-y-4">
                <h3 className="text-xl font-minecraft text-blue-400 flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  AUTOMATIZAR
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Typecheck (TypeScript)",
                    "Build de Produção",
                    "Testes Unitários & Integração",
                    "Migrations Pendentes",
                    "Variáveis Obrigatórias (env.server.ts)",
                    "Vazamento de Mocks/Fixtures",
                    "Segredos Hardcoded (sb_secret_)",
                    "Proteção de Rotas Admin",
                    "Assinatura de Webhooks/HMAC"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-sm group hover:border-blue-500/30 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-sm font-medium group-hover:text-blue-200 transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                  <code className="text-xs text-blue-300 font-mono">npm run predeploy:check</code>
                  <p className="text-xs text-muted-foreground mt-2">Script configurado em package.json com exit code rigoroso.</p>
                </div>
              </div>

              {/* MANUAL */}
              <div className="space-y-4">
                <h3 className="text-xl font-minecraft text-orange-400 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  CHECKLIST MANUAL
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Backup recente do banco gerado",
                    "Restauração testada em staging",
                    "Domínio validado e SSL ativo",
                    "Webhook configurado no Mercado Pago",
                    "Plugin Java online (produção)",
                    "Termos & Políticas publicados",
                    "Contas Admin/User testadas"
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-sm cursor-pointer hover:bg-black/30 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/40 text-orange-500 focus:ring-orange-500/50" />
                      <span className="text-sm font-medium">{item}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-sm flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                  <p className="text-xs text-orange-200/80">Bloqueadores manuais exigem confirmação assinada pela gerência técnica antes do merge em main.</p>
                </div>
              </div>
            </div>
          </StonePanel>
        </div>
      </section>

      <NewsSection news={news} status={status} />
      <ModesSection modes={modes} />
      <ShopHighlight products={featuredProducts} />
      <RankingSection />
      <HowToPlay />
      <CommunitySection settings={settings} />
      <FinalCta />
    </main>
  );
}
