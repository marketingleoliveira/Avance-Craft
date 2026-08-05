import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { Shield, MessageSquare, Instagram, Youtube, Share2, Heart, ExternalLink } from "lucide-react";

const NAV_LINKS = [
  { label: "Início", to: "/" },
  { label: "Loja VIP", to: "/loja" },
  { label: "Notícias", to: "/noticias" },
  { label: "Ranking", to: "/ranking" },
  { label: "Como Jogar", to: "/como-jogar" },
] as const;

const SUPPORT_LINKS = [
  { label: "Suporte", to: "/suporte" },
  { label: "Regras", to: "/regras" },
  { label: "Equipe", to: "/equipe" },
  { label: "Termos", to: "/termos" },
  { label: "Privacidade", to: "/privacidade" },
] as const;

const SOCIAL_LINKS = [
  { label: "Discord", href: "https://discord.gg/avance", icon: MessageSquare },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "TikTok", href: "#", icon: Share2 },
  { label: "YouTube", href: "#", icon: Youtube },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-stone-950 pt-24 pb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-[950] uppercase italic tracking-tighter text-white">
                AV<span className="text-emerald-500">ANCE</span>
              </span>
            </Link>
            <p className="text-stone-400 font-medium leading-relaxed max-w-xs">
              A maior e mais ambiciosa comunidade brasileira de Minecraft. Explore mundos, conquiste reinos e forje sua lenda.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a 
                  key={social.label} 
                  href={social.href}
                  className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-stone-400 hover:bg-emerald-500 hover:text-stone-950 hover:border-emerald-500 transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Navegação</h3>
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-stone-300 font-bold uppercase tracking-widest text-[10px] hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800 group-hover:bg-emerald-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Utilidades</h3>
            <ul className="space-y-4">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-stone-300 font-bold uppercase tracking-widest text-[10px] hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800 group-hover:bg-emerald-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer / Info */}
          <div className="space-y-8">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Aviso Legal</span>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-500 font-medium uppercase tracking-wider">
                Projeto independente, sem vínculo com a Mojang Studios ou Microsoft. Todos os direitos reservados aos respectivos detentores.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-stone-900/50 rounded-full border border-white/5 inline-block">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Status: Sistema Online</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
            © {year} Avance. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
            Feito com <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" /> pela Equipe Avance
          </div>
        </div>
      </Container>
    </footer>
  );
}
