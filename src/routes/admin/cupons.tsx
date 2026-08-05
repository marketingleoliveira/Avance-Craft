import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/cupons")({
  component: () => <PlaceholderPage title="Cupons de Desconto" description="Configuração de campanhas promocionais." />,
});
