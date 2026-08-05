import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/contato")({
  component: () => (
    <PlaceholderPage
      title="Fale Conosco"
      description="Canais oficiais de atendimento e suporte comercial."
    />
  ),
});
