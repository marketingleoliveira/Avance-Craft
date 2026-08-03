import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Loja do Habblet Mine — Servidor Brasileiro";
const description = "Vitrine de kits e vantagens do servidor Habblet Mine.";

export const Route = createFileRoute("/loja")({
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
  component: () => <PlaceholderPage title="Loja" description="Aqui ficarão os pacotes, kits e vantagens do servidor." />,
});
