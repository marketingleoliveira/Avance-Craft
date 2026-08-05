import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/categorias")({
  component: () => <PlaceholderPage title="Categorias" description="Gerenciamento de categorias de produtos." />,
});
