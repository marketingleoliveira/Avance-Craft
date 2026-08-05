import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/tickets")({
  component: () => <PlaceholderPage title="Suporte (Tickets)" description="Atendimento a jogadores e resolução de problemas." />,
});
