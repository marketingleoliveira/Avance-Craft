import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Perfil — Habblet Mine";
const description = "Área do jogador do servidor Habblet Mine.";

export const Route = createFileRoute("/perfil")({
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
  component: () => <PlaceholderPage title="Perfil" description="Área do jogador: estatísticas, compras e preferências." />,
});
