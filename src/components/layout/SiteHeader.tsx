import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, LogIn, Play } from "lucide-react";
import { Container } from "@/components/ui-kit/Container";
import { StatusBar } from "@/components/layout/StatusBar";
import { NAV_LINKS } from "@/data/mock";
import grassDirt from "@/assets/tex-grass-dirt.jpg";
import wood from "@/assets/tex-wood.jpg";
import stone from "@/assets/tex-stone.jpg";

/** Escada decorativa (lateral do menu). */
function LadderDecor({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div
        className="relative h-full w-10"
        style={{ backgroundImage: `url(${wood})`, backgroundSize: "48px" }}
      >
        <span className="absolute inset-y-0 left-[6px] w-[4px] bg-wood-dark" />
        <span className="absolute inset-y-0 right-[6px] w-[4px] bg-wood-dark" />
        <div className="absolute inset-0 flex flex-col justify-around py-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="mx-[6px] h-[4px] bg-wood-dark" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* faixa de grama superior */}
      <div className="h-3 w-full bg-grass shadow-[inset_0_-4px_0_0_var(--grass-dark)]" />

      <div
        className="relative border-b-[6px] border-stone-dark"
        style={{
          backgroundImage: `url(${grassDirt})`,
          backgroundSize: "72px",
          imageRendering: "pixelated",
        }}
      >
        <div className="absolute inset-0 bg-dirt-dark/45" aria-hidden />

        <Container className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:flex lg:gap-5">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span
              className="pixel-border border-dirt-dark grid h-11 w-11 shrink-0 place-items-center"
              style={{ backgroundImage: `url(${wood})`, backgroundSize: "60px" }}
              aria-hidden
            >
              <span className="h-4 w-4 bg-emerald-block" />
            </span>
            <span className="font-pixel min-w-0 text-[10px] uppercase leading-[1.5] text-parchment text-outline sm:text-sm">
              Habblet<span className="block sm:inline sm:before:content-['\\00a0']">Mine</span>
            </span>
          </Link>

          {/* Menu central suspenso */}
          <div className="hidden flex-1 justify-center lg:flex">
            <div className="relative flex items-stretch">
              <LadderDecor className="flex" />
              <nav
                className="pixel-border border-dirt-dark flex items-center gap-0.5 px-2 py-1.5 shadow-[0_6px_0_0_var(--stone-dark)]"
                style={{
                  backgroundImage: `url(${wood})`,
                  backgroundSize: "80px",
                  imageRendering: "pixelated",
                }}
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    activeOptions={{ exact: link.to === "/" }}
                    activeProps={{
                      className: "bg-grass-dark text-parchment",
                    }}
                    className="font-pixel whitespace-nowrap px-2.5 py-2 text-[9px] uppercase leading-none text-dirt-dark transition-colors hover:bg-dirt-dark/25 xl:px-3 xl:text-[10px]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <LadderDecor className="flex" />
            </div>
          </div>

          {/* Ações */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/perfil"
              className="font-pixel pixel-border hidden border-wood-dark bg-wood px-3 py-2.5 text-[9px] uppercase text-dirt-dark shadow-[0_4px_0_0_var(--wood-dark)] transition-transform hover:brightness-105 active:translate-y-[2px] active:shadow-none sm:inline-flex sm:items-center sm:gap-2"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Entrar
            </Link>
            <Link
              to="/como-jogar"
              className="font-pixel pixel-border inline-flex items-center gap-2 border-grass-dark bg-emerald-block px-3 py-2.5 text-[9px] uppercase text-accent-foreground shadow-[0_4px_0_0_var(--grass-dark)] transition-transform hover:brightness-105 active:translate-y-[2px] active:shadow-none sm:px-4"
            >
              <Play className="h-4 w-4" aria-hidden />
              <span className="hidden xs:inline">Jogar agora</span>
              <span className="xs:hidden">Jogar</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              className="pixel-border border-dirt-dark bg-wood p-2.5 text-dirt-dark lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        {/* Menu mobile */}
        {open ? (
          <div
            className="relative border-t-4 border-dirt-dark lg:hidden"
            style={{ backgroundImage: `url(${wood})`, backgroundSize: "80px" }}
          >
            <Container className="grid gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="font-pixel border-b-2 border-dirt-dark/25 px-2 py-3 text-[11px] uppercase text-dirt-dark"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/perfil"
                onClick={() => setOpen(false)}
                className="font-pixel px-2 py-3 text-[11px] uppercase text-grass-dark"
              >
                Entrar
              </Link>
            </Container>
          </div>
        ) : null}
      </div>

      {/* borda inferior de pedra */}
      <div
        className="h-2 w-full"
        style={{ backgroundImage: `url(${stone})`, backgroundSize: "48px" }}
        aria-hidden
      />

      <StatusBar />
    </header>
  );
}
