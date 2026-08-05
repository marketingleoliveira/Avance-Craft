import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Como Jogar — Avance";
const description = "Guia passo a passo para entrar no servidor Avance.";

export const Route = createFileRoute("/como-jogar")({
  head: () => ({
    meta: [
      { title: "Como Jogar | Avance — Guia de Conexão" },
      { name: "description", content: "Aprenda a entrar no Avance usando Java ou Bedrock Edition. Versões suportadas, IP e tutoriais." },
      { property: "og:title", content: "Como Jogar no Avance" },
      { property: "og:description", content: "Guia completo de conexão para Java e Bedrock." },
      { property: "og:type", content: "article" },
    ],
  }),

  component: () => <PlaceholderPage title="Como Jogar" description="Guia de conexão, versões suportadas e primeiros passos." />,
});
