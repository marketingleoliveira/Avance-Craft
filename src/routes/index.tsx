import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { 
  listPublishedNews, 
  listRankings, 
  getServerStatus, 
  listServerModes 
} from "@/lib/services/content.functions";
import { listProducts } from "@/lib/services/catalog.functions";
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
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["published-news", 3],
        queryFn: () => listPublishedNews({ data: { limit: 3 } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["server-status"],
        queryFn: () => getServerStatus(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["server-modes"],
        queryFn: () => listServerModes(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["featured-products", true, 3],
        queryFn: () => listProducts({ data: { featuredOnly: true, limit: 3 } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["rankings", "ricos", "weekly", 5],
        queryFn: () => listRankings({ data: { category: "ricos", period: "weekly", limit: 5 } }),
      }),
    ]);
  },
  component: Index,
});

function Index() {
  const [
    newsQuery,
    statusQuery,
    modesQuery,
    featuredProductsQuery,
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["published-news", 3],
        queryFn: () => listPublishedNews({ data: { limit: 3 } }),
      },
      {
        queryKey: ["server-status"],
        queryFn: () => getServerStatus(),
      },
      {
        queryKey: ["server-modes"],
        queryFn: () => listServerModes(),
      },
      {
        queryKey: ["featured-products", true, 3],
        queryFn: () => listProducts({ data: { featuredOnly: true, limit: 3 } }),
      },
    ],
  });

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
