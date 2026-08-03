import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Notícias — Habblet Mine";
const description = "Atualizações, eventos e novidades do servidor Habblet Mine.";

export const Route = createFileRoute("/noticias")({
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
  component: () => <PlaceholderPage title="Notícias" description="Espaço para atualizações, eventos e notas de versão." />,
});
