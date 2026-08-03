import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Política de Privacidade — Habblet Mine";
const description = "Como o Habblet Mine trata dados de jogadores e visitantes do portal.";

export const Route = createFileRoute("/privacidade")({
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
  component: () => (
    <PlaceholderPage
      title="Privacidade"
      description="Informações sobre coleta, uso e remoção de dados no portal Habblet Mine."
    />
  ),
});
