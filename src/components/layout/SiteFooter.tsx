import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { BlockDivider } from "@/components/ui-kit/BlockDivider";


const NAV_LINKS = [
  { label: "Início", to: "/" },
  { label: "Loja", to: "/loja" },
  { label: "Notícias", to: "/noticias" },
  { label: "Ranking", to: "/ranking" },
  { label: "Como Jogar", to: "/como-jogar" },
  { label: "Regras", to: "/regras" },
  { label: "Equipe", to: "/equipe" },
  { label: "Suporte", to: "/suporte" },
] as const;

const SOCIAL_LINKS = [
  { label: "Discord", href: "https://discord.gg/habbletmine" },
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "YouTube", href: "#" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();


  return (
    <footer className="mt-16">
      <BlockDivider />
      <div className="bg-dirt-dark text-parchment">
        <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-pixel text-outline text-[13px] uppercase text-emerald-block">
              Habblet
              <br />
              Mine
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-parchment/80">
              Portal comunitário de um servidor brasileiro de blocos, com economia, missões
              e eventos.
            </p>
            <p className="mt-3 break-all bg-black/25 p-2 text-sm font-semibold">
              jogar.habbletmine.com.br
            </p>

          </div>

          <nav aria-label="Rodapé">
            <h3 className="font-pixel text-[11px] uppercase text-emerald-block">Navegar</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-emerald-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-pixel text-[11px] uppercase text-emerald-block">Redes</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a href={social.href} className="hover:text-emerald-block">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-pixel text-[11px] uppercase text-emerald-block">Legal</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              <li>
                <Link to="/termos" className="hover:text-emerald-block">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-emerald-block">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link to="/suporte" className="hover:text-emerald-block">
                  Suporte
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-parchment/70">
              Projeto independente, sem vínculo, patrocínio ou aprovação da Mojang Studios,
              Microsoft ou detentores de marcas de jogos.
            </p>
          </div>
        </Container>

        <div className="border-t-4 border-black/25">
          <Container className="py-4">
            <p className="text-xs text-parchment/70">
              © {year} Habblet Mine. Servidor brasileiro de blocos.
            </p>

          </Container>
        </div>
      </div>
    </footer>
  );
}
