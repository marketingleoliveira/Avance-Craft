import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/configuracoes")({
  component: () => <PlaceholderPage title="Configurações Globais" description="Ajustes técnicos e visuais do portal." />,
});
