import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Termos de Uso — Habblet Mine";
const description = "Termos de uso do portal e do servidor Habblet Mine.";

export const Route = createFileRoute("/termos")({
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
      title="Termos de uso"
      description="Condições de uso do portal, das compras e da conta de jogador."
    />
  ),
});
