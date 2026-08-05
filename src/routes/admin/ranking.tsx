import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/ranking")({
  component: () => <PlaceholderPage title="Gestão de Rankings" description="Acompanhamento e ajuste de tabelas de liderança." />,
});
