import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { NewsSection } from "@/components/home/NewsSection";
import { ShopHighlight } from "@/components/home/ShopHighlight";
import { RankingAndSteps } from "@/components/home/RankingAndSteps";
import { BlockDivider } from "@/components/ui-kit/BlockDivider";

const title = "Habblet Mine — Servidor Brasileiro de Minecraft";
const description =
  "Portal do Habblet Mine: notícias, loja, ranking e guias para jogar no servidor brasileiro de blocos.";

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
      <ShopHighlight />
      <RankingAndSteps />
      <BlockDivider />
    </main>
  );
}
