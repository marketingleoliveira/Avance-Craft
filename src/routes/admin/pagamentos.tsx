import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin/pagamentos")({
  component: () => <PlaceholderPage title="Pagamentos" description="Conciliação e histórico de transações financeiras." />,
});
