import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Ranking — Habblet Mine";
const description = "Ranking de jogadores e clãs do servidor Habblet Mine.";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderPage title="Ranking" description="Aqui ficarão as tabelas de jogadores, clãs e temporadas." />,
});
