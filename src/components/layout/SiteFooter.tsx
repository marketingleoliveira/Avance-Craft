import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { 
  Shield, 
  MessageSquare, 
  Instagram, 
  Youtube, 
  Twitter, 
  Circle,
  Mail,
  FileText,
  Info,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const FOOTER_VERSION = "2.1.0-PRIME";

const SOCIAL_LINKS = [
  { label: "Discord", href: "https://discord.gg/avance", icon: MessageSquare, color: "#5865F2" },
  { label: "Instagram", href: "#", icon: Instagram, color: "#E4405F" },
  { label: "TikTok", href: "#", icon: Circle, color: "#000000" }, // Circle as placeholder for TikTok
  { label: "YouTube", href: "#", icon: Youtube, color: "#FF0000" },
] as const;

const LINKS_COL_1 = [
  { label: "Início", to: "/" },
  { label: "Loja Oficial", to: "/loja" },
  { label: "Notícias", to: "/noticias" },
  { label: "Hall da Fama", to: "/ranking" },
  { label: "Como Jogar", to: "/como-jogar" },
];

const LINKS_COL_2 = [
  { label: "Suporte", to: "/suporte" },
  { label: "Regras", to: "/regras" },
  { label: "Equipe", to: "/equipe" },
  { label: "Termos de Uso", to: "/termos" },
  { label: "Privacidade", to: "/privacidade" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-stone-950 border-t border-white/5 pt-32 pb-12 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-10">
            <Link to="/" className="inline-block group">
              <span className="text-4xl font-[950] uppercase italic tracking-tighter text-white transition-all group-hover:text-emerald-400">
                AV<span className="text-emerald-500 group-hover:text-white">ANCE</span>
              </span>
            </Link>
            
            <p className="text-stone-400 font-medium text-lg leading-relaxed max-w-md">
              A experiência definitiva em Minecraft. 
              Mergulhe em um universo de possibilidades onde cada bloco conta uma história.
            </p>

            <div className="flex flex-wrap gap-4">
              {SOCIAL_LINKS.map((social) => (
                <motion.a 
                  key={social.label} 
                  href={social.href}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-stone-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors group relative"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6 transition-transform" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 text-stone-950 text-[9px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {social.label}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50">Explore</h3>
            <ul className="space-y-4">
              {LINKS_COL_1.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-stone-400 font-bold uppercase tracking-widest text-[11px] hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50">Institucional</h3>
            <ul className="space-y-4">
              {LINKS_COL_2.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-stone-400 font-bold uppercase tracking-widest text-[11px] hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Status & Contact */}
          <div className="lg:col-span-3 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50">Rede</h3>
            
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sistemas OK</span>
                  </div>
                  <span className="text-[9px] font-bold text-stone-600 uppercase italic">v{FOOTER_VERSION}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white uppercase tracking-tight">jogar.avance.com.br</p>
                  <p className="text-[9px] font-medium text-stone-500 uppercase tracking-widest">Servidor Brasileiro</p>
                </div>
              </div>

              <a 
                href="mailto:contato@avance.com.br"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-stone-400 group-hover:text-emerald-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest">E-mail de Contato</p>
                  <p className="text-[10px] font-bold text-stone-300 group-hover:text-white transition-colors">contato@avance.com.br</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.2em]">
              © {year} Avance. Todos os direitos reservados.
            </p>
            <div className="hidden md:block w-[1px] h-3 bg-white/5" />
            <div className="flex items-center gap-4 text-[9px] font-bold text-stone-500 uppercase tracking-[0.15em]">
              <Link to="/termos" className="hover:text-emerald-500 transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-emerald-500 transition-colors">Privacidade</Link>
              <Link to="/regras" className="hover:text-emerald-500 transition-colors">Regras</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] group">
            <div className="flex items-center gap-1">
              <span className="group-hover:text-white transition-colors">Powered by</span>
              <span className="text-emerald-500">Avance Engine</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-800" />
            <div className="flex items-center gap-1">
              <span>Status</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-[9px] text-stone-700 font-medium uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed opacity-50 hover:opacity-100 transition-opacity cursor-default">
            O Avance é um projeto independente de fãs e não possui qualquer afiliação com a Mojang Studios ou Microsoft. Todas as marcas registradas pertencem aos seus respectivos proprietários.
          </p>
        </div>
      </Container>
    </footer>
  );
}
