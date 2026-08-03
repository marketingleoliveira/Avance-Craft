import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, User } from "lucide-react";
import { Container } from "@/components/ui-kit/Container";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { NAV_LINKS } from "@/data/mock";
import grassDirt from "@/assets/tex-grass-dirt.jpg";
import wood from "@/assets/tex-wood.jpg";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b-4 border-dirt-dark"
      style={{
        backgroundImage: `url(${grassDirt})`,
        backgroundSize: "64px",
        imageRendering: "pixelated",
      }}
    >
      <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span
            className="pixel-border border-dirt-dark grid h-10 w-10 shrink-0 place-items-center"
            style={{ backgroundImage: `url(${wood})`, backgroundSize: "60px" }}
            aria-hidden
          >
            <span className="h-4 w-4 bg-emerald-block" />
          </span>
          <span className="font-pixel truncate text-[11px] uppercase text-parchment text-outline sm:text-sm">
            Habblet Mine
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "bg-dirt-dark/85" }}
              className="font-pixel px-3 py-2 text-[9px] uppercase text-parchment transition-colors hover:bg-dirt-dark/70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/perfil" className="hidden sm:block">
            <PixelButton variant="wood">
              <User className="h-4 w-4" aria-hidden />
              Perfil
            </PixelButton>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="pixel-border border-dirt-dark bg-wood p-2 text-dirt-dark lg:hidden"
          >
            {open ? <Menu className="h-5 w-5" /> : <X className="hidden" />}
            {open ? null : <span className="sr-only">menu</span>}
          </button>
        </div>
      </Container>

      {open ? (
        <div className="border-t-4 border-dirt-dark bg-dirt-dark/95 lg:hidden">
          <Container className="grid gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="font-pixel px-3 py-3 text-[10px] uppercase text-parchment hover:bg-grass-dark"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="font-pixel px-3 py-3 text-[10px] uppercase text-emerald-block"
            >
              Perfil
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
