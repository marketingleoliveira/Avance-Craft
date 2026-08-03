import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { NewsSection } from "@/components/home/NewsSection";
import { ModesSection } from "@/components/home/ModesSection";
import { ShopHighlight } from "@/components/home/ShopHighlight";
import { RankingSection } from "@/components/home/RankingSection";
import { HowToPlay } from "@/components/home/HowToPlay";
import { CommunitySection } from "@/components/home/CommunitySection";
import { FinalCta } from "@/components/home/FinalCta";

const title = "Habblet Mine — Servidor Brasileiro de Minecraft";
const description =
  "Portal do Habblet Mine: notícias, modalidades, loja, ranking e guias para jogar no servidor brasileiro de blocos.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <NewsSection />
      <ModesSection />
      <ShopHighlight />
      <RankingSection />
      <HowToPlay />
      <CommunitySection />
      <FinalCta />
    </main>
  );
}
