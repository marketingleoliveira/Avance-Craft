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
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { CheckCircle2, AlertCircle, Terminal, ClipboardCheck, TestTube, CreditCard, Activity, Lock } from "lucide-react";

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

      {/* Checklist de Pré-deploy & Test Harness (Apenas em Dev/Staging ou para Staff) */}
      <section className="py-16 bg-background/50 border-y border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 max-w-[1180px]">
          <StonePanel className="p-8 border-yellow-600/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-minecraft text-yellow-500 mb-2">Controle de Qualidade Staging</h2>
                <p className="text-muted-foreground italic">Validação técnica completa da integração Mercado Pago & Pré-deploy.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                  <Link to="/admin">
                    <PixelButton className="px-6 w-full bg-slate-700 hover:bg-slate-600 border-slate-800">
                      <Lock className="w-4 h-4 mr-2" />
                      Dashboard
                    </PixelButton>
                  </Link>
                  <Link to="/admin/pagamentos-teste">
                    <PixelButton className="px-6 w-full bg-blue-600 hover:bg-blue-500 border-blue-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagamentos
                    </PixelButton>
                  </Link>
                  <Link to="/admin/plugin-teste">
                    <PixelButton className="px-6 w-full bg-indigo-600 hover:bg-indigo-500 border-indigo-700">
                      <Terminal className="w-4 h-4 mr-2" />
                      Plugin/Minecraft
                    </PixelButton>
                  </Link>
                  <Link to="/beta">
                    <PixelButton className="px-6 w-full bg-yellow-600 hover:bg-yellow-500 border-yellow-700">
                      <Lock className="w-4 h-4 mr-2" />
                      Beta Program
                    </PixelButton>
                  </Link>
                  <Link to="/beta/feedback">
                    <PixelButton className="px-6 w-full bg-green-600 hover:bg-green-500 border-green-700">
                      <Lock className="w-4 h-4 mr-2" />
                      Beta Feedback
                    </PixelButton>
                  </Link>
                  <PixelButton 
                    variant="stone"
                    className="px-6"
                    onClick={() => window.open('/admin/saude', '_self')}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Saúde
                  </PixelButton>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* TEST HARNESS PAGAMENTOS */}
              <div className="space-y-4">
                <h3 className="text-xl font-minecraft text-blue-400 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  TESTE MERCADO PAGO
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Criação de Pedido & Recálculo Server-side",
                    "Geração de Preferência (init_point)",
                    "Retornos: Sucesso, Pendente, Falha",
                    "Recebimento & Validação de Webhook",
                    "Consulta Direta no Provedor (API MP)",
                    "Persistência em payments & events",
                    "Idempotência da Fila de Entrega",
                    "Webhooks Duplicados ou Inválidos"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-sm group hover:border-blue-500/30 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-[11px] font-medium group-hover:text-blue-200 transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                  <p className="text-[10px] text-blue-300">Ambiente isolado. Webhooks simulam assinatura válida sem expor secrets de produção.</p>
                </div>
              </div>

              {/* CHECKLIST PRÉ-DEPLOY */}
              <div className="space-y-4">
                <h3 className="text-xl font-minecraft text-orange-400 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  CHECKLIST PRÉ-DEPLOY
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "1. Release Candidate (v1.0.0-rc.1)",
                    "2. Ambientes (Dev, Staging, Prod)",
                    "3. Feature Flags & Governança",
                    "4. Infraestrutura de Staging Isolada",
                    "5. Pipeline de Pré-deploy Automatizado",
                    "6. Mercado Pago Test Harness",
                    "7. Plugin Integration Test Harness",
                    "8. Sistema de Closed Beta & Convites",
                    "9. Feedback & Bug Report de Usuários",
                    "10. Dashboard Operacional de Lançamento",
                    "11. Termos, Políticas & Aceite Legal",
                    "12. Deploy Hostinger (Docker/Nginx)",
                    "13. Plano de Backup & PITR (Supabase)",
                    "14. Runbook de Rollback de Emergência",
                    "15. Simulação de Lançamento em Staging",
                    "16. Ativação Gradual (Phased Rollout)",
                    "17. Compra Real Controlada (Validation)",
                    "18. Quality Gate de Produção Concluído",
                    "🚀 LANÇAMENTO HABBLET MINE V1.0.0"











                  ].map((item) => (
                    <label key={item} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-sm cursor-pointer hover:bg-black/30 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/40 text-orange-500 focus:ring-orange-500/50" />
                      <span className="text-[11px] font-medium">{item}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-sm flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                  <p className="text-[10px] text-orange-200/80">Bloqueadores automáticos via <code>npm run predeploy:check</code> no repositório.</p>
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

