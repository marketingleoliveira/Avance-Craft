import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Regras — Habblet Mine";
const description = "Regras de convivência e punições do servidor Habblet Mine.";

export const Route = createFileRoute("/regras")({
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
  component: () => <PlaceholderPage title="Regras" description="Regras de convivência, moderação e sistema de punições." />,
});
