import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/produtos")({
  component: () => <PlaceholderPage title="Catálogo de Produtos" description="Criação e edição de produtos da loja." />,
});
