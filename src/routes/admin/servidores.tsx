import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/servidores")({
  component: () => <PlaceholderPage title="Servidores" description="Monitoramento de instâncias e status de rede." />,
});
