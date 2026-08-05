import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Regras — Habblet Mine";
const description = "Regras de convivência e punições do servidor Habblet Mine.";

export const Route = createFileRoute("/regras")({
  head: () => ({
    meta: [
      { title: "Regras de Conduta | Habblet Mine" },
      { name: "description", content: "Conheça as diretrizes de convivência e o sistema de punições do Habblet Mine para garantir a diversão de todos." },
      { property: "og:title", content: "Regras | Habblet Mine" },
      { property: "og:description", content: "Mantenha o jogo justo e divertido para todos." },
      { property: "og:type", content: "article" },
    ],
  }),

  component: () => <PlaceholderPage title="Regras" description="Regras de convivência, moderação e sistema de punições." />,
});
