import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/auditoria")({
  component: () => <PlaceholderPage title="Logs de Auditoria" description="Rastro completo de ações administrativas." />,
});
