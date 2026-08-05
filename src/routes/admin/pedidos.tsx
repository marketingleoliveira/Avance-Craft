import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/pedidos")({
  component: () => <PlaceholderPage title="Gestão de Pedidos" description="Visualização e controle de todos os pedidos do sistema." />,
});
