import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, User, Play, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui-kit/Container";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Início", to: "/" },
  { 
    label: "Servidor", 
    children: [
      { label: "Como Jogar", to: "/como-jogar" },
      { label: "Regras", to: "/regras" },
      { label: "Equipe", to: "/equipe" },
      { label: "Ranking", to: "/ranking" },
    ]
  },
  { label: "Loja", to: "/loja" },
  { label: "Notícias", to: "/noticias" },
  { label: "Suporte", to: "/suporte" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled 
          ? "bg-stone-950/80 backdrop-blur-xl border-b border-white/5 py-3" 
          : "bg-transparent py-5"
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 blur-lg group-hover:bg-emerald-500/40 transition-colors" />
            <span className="relative h-5 w-5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] rotate-45 transition-transform group-hover:rotate-90 duration-500" />
          </div>
          <span className="font-sans font-[900] text-3xl tracking-[-0.05em] text-white uppercase italic">
            Avance
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="relative group/item">
              {"to" in link ? (
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  activeProps={{ className: "text-emerald-400" }}
                  className="px-4 py-2 text-[13px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors flex items-center gap-1"
                >
                  {link.label}
                </Link>
              ) : (
                <>
                  <button className="px-4 py-2 text-[13px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors flex items-center gap-1">
                    {link.label}
                    <ChevronDown className="w-3 h-3 transition-transform group-hover/item:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 translate-y-2 group-hover/item:translate-y-0">
                    <div className="bg-stone-900/95 backdrop-blur-xl border border-white/10 p-2 min-w-[200px] shadow-2xl">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="block px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/perfil"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-colors border border-white/10"
          >
            <User className="w-4 h-4" />
            Perfil
          </Link>

          <Link
            to="/como-jogar"
            className="relative group flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-stone-950 text-[11px] font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            <Play className="w-3.5 h-3.5 fill-current" />
            Jogar Agora
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 text-white lg:hidden hover:bg-white/5 transition-colors"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 top-[72px] bg-stone-950/95 backdrop-blur-2xl transition-all duration-500 overflow-y-auto",
          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
        )}
      >
        <Container className="py-8 flex flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="flex flex-col gap-2">
              {"to" in link ? (
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-black uppercase tracking-tighter text-white/40 hover:text-emerald-400 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <>
                  <span className="text-sm font-bold uppercase tracking-widest text-emerald-500/50">
                    {link.label}
                  </span>
                  <div className="flex flex-col gap-4 pl-4 border-l border-white/10">
                    {link.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={() => setOpen(false)}
                        className="text-xl font-bold uppercase tracking-tight text-white/60"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
             <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 text-white/60 font-bold uppercase tracking-widest text-sm"
            >
              <User className="w-5 h-5" /> Meu Perfil
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
