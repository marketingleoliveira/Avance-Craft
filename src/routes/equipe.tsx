import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Equipe — Avance";
const description = "Conheça a equipe de moderação e administração do Avance.";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Nossa Equipe | Avance" },
      { name: "description", content: "Conheça os administradores e moderadores responsáveis por manter o Avance seguro e organizado." },
      { property: "og:title", content: "Equipe Oficial | Avance" },
      { property: "og:description", content: "Conheça quem faz o servidor acontecer." },
      { property: "og:type", content: "website" },
    ],
  }),

  component: () => <PlaceholderPage title="Equipe" description="Apresentação da equipe de moderação e administração." />,
});
