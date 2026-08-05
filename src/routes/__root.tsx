import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { checkSystemHealth } from "@/lib/config/health-check.functions";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getServerFlags } from "@/lib/config/flags";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { Lock, AlertTriangle } from "lucide-react";
import { isStaging } from "@/lib/config/env.server";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="relative inline-block">
          <h1 className="text-[120px] font-pixel text-primary leading-none">404</h1>
          <div className="absolute -top-4 -right-4 bg-red-500 text-white px-2 py-1 text-xs font-pixel rotate-12">
            OOPS!
          </div>
        </div>
        <h2 className="text-3xl font-pixel text-foreground">Página Perdida na Caverna</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Parece que você cavou no lugar errado! O endereço que você procura não existe ou foi minerado para outro local.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="px-8 py-4 bg-primary text-primary-foreground font-pixel text-sm rounded-none border-b-4 border-primary-dark hover:translate-y-1 hover:border-b-0 transition-all inline-block"
          >
            Voltar ao Spawn
          </Link>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...(isStaging() ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      { title: "Avance" },
      { name: "description", content: "Portal do servidor brasileiro Avance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Avance" },
      { name: "twitter:title", content: "Avance" },
      { property: "og:description", content: "Portal do servidor brasileiro Avance." },
      { name: "twitter:description", content: "Portal do servidor brasileiro Avance." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/98ca8ef2-57d9-4488-95ad-3f24ecd6dacb/id-preview-eca6f6b8--6a6811b0-b68a-424a-8f2c-66169d9656f8.lovable.app-1785764486740.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/98ca8ef2-57d9-4488-95ad-3f24ecd6dacb/id-preview-eca6f6b8--6a6811b0-b68a-424a-8f2c-66169d9656f8.lovable.app-1785764486740.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const fetchFlags = useServerFn(getServerFlags);

  useEffect(() => {
    // Check maintenance mode
    fetchFlags().then(flags => {
      if (flags?.MAINTENANCE_MODE) {
        // Only show maintenance if not an admin route (staff needs access)
        if (!window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/auth')) {
          setIsMaintenance(true);
        }
      }
    });

    // Perform startup health and config validation
    checkSystemHealth().then(health => {
      if (health.status === 'unhealthy') {
        console.error('System health check failed:', health.error);
      }
    });
  }, [fetchFlags]);

  if (isMaintenance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 p-4">
        <StonePanel className="max-w-md w-full p-8 text-center space-y-6 border-t-4 border-t-amber-500">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-500/10 rounded-full">
              <Lock className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-pixel text-stone-100">Manutenção em Andamento</h1>
          <p className="text-stone-400 text-sm font-sans leading-relaxed">
            Estamos minerando algumas atualizações importantes para melhorar sua experiência. 
            Voltaremos em breve com novidades!
          </p>
          <div className="pt-4 border-t border-stone-800">
            <p className="text-[10px] font-pixel text-stone-500">AVANCE — STATUS: EM MANUTENÇÃO</p>
          </div>
        </StonePanel>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-stone-950 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
        {isStaging() && (
          <div className="bg-amber-500 text-amber-950 py-1 px-4 text-center font-pixel text-[8px] flex items-center justify-center gap-2 sticky top-0 z-[100] shadow-md uppercase">
            <AlertTriangle className="w-3 h-3" /> Ambiente de Staging — Dados podem ser resetados
          </div>
        )}
        <StatusBar />
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>

        {/* O Footer é renderizado diretamente nas páginas de conteúdo para permitir animações específicas e melhor controle de scroll reveal */}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

