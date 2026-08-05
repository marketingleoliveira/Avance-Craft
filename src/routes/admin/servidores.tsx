import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/servidores")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/ranking" });
  },
});
