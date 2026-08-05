import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/noticias")({
  component: () => <PlaceholderPage title="Editor de Notícias" description="Publicação de novidades e avisos para a comunidade." />,
});
