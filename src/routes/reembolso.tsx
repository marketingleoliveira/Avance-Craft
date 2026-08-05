import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/reembolso")({
  component: () => (
    <PlaceholderPage
      title="Política de Reembolso"
      description="Regras para solicitação de estorno e devoluções."
    />
  ),
});
