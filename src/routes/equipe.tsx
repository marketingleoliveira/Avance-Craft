import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Equipe — Habblet Mine";
const description = "Conheça a equipe de moderação e administração do Habblet Mine.";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Nossa Equipe | Habblet Mine" },
      { name: "description", content: "Conheça os administradores e moderadores responsáveis por manter o Habblet Mine seguro e organizado." },
      { property: "og:title", content: "Equipe Oficial | Habblet Mine" },
      { property: "og:description", content: "Conheça quem faz o servidor acontecer." },
      { property: "og:type", content: "website" },
    ],
  }),

  component: () => <PlaceholderPage title="Equipe" description="Apresentação da equipe de moderação e administração." />,
});
