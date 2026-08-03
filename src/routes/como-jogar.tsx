import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Como Jogar — Habblet Mine";
const description = "Guia passo a passo para entrar no servidor Habblet Mine.";

export const Route = createFileRoute("/como-jogar")({
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
  component: () => <PlaceholderPage title="Como Jogar" description="Guia de conexão, versões suportadas e primeiros passos." />,
});
