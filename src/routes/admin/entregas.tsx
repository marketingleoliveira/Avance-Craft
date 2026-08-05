import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/entregas")({
  component: () => <PlaceholderPage title="Fila de Entregas" description="Status das entregas de comandos para o servidor de Minecraft." />,
});
