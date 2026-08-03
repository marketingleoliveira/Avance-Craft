import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blank Project" },
      { name: "description", content: "A clean blank canvas ready for your ideas." },
      { property: "og:title", content: "Blank Project" },
      { property: "og:description", content: "A clean blank canvas ready for your ideas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Blank canvas</p>
    </main>
  );
}
