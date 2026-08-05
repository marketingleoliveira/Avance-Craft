import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/jogadores")({
  component: () => <PlaceholderPage title="Base de Jogadores" description="Histórico e perfis de jogadores vinculados." />,
});
