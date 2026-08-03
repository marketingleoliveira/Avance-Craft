import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Equipe — Habblet Mine";
const description = "Conheça a equipe de moderação e administração do Habblet Mine.";

export const Route = createFileRoute("/equipe")({
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
  component: () => <PlaceholderPage title="Equipe" description="Apresentação da equipe de moderação e administração." />,
});
