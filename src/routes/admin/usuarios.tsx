import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/usuarios")({
  component: () => <PlaceholderPage title="Equipe Administrativa" description="Controle de acesso e permissões de staff." />,
});
