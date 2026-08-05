import { createFileRoute } from "@tanstack/react-router";
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
    <main>
      <Hero settings={settings} />
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
