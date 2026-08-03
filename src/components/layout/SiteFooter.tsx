import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { BlockDivider } from "@/components/ui-kit/BlockDivider";
import { NAV_LINKS, MOCK_SERVER } from "@/data/mock";

export function SiteFooter() {
  return (
    <footer className="mt-16">
      <BlockDivider />
      <div className="bg-dirt-dark text-parchment">
        <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-pixel text-[11px] uppercase text-emerald-block">
              Habblet Mine
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-parchment/80">
              Portal comunitário de um servidor brasileiro de blocos. Projeto independente,
              sem vínculo com detentores de marcas de jogos.
            </p>
          </div>
          <div>
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
          </div>
          <div>
            <h3 className="font-pixel text-[11px] uppercase text-emerald-block">Conta</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              <li>
                <Link to="/perfil" className="hover:text-emerald-block">
                  Perfil
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-block">
                  Painel administrativo
                </Link>
              </li>
              <li>
                <Link to="/suporte" className="hover:text-emerald-block">
                  Abrir chamado
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-pixel text-[11px] uppercase text-emerald-block">Conectar</h3>
            <p className="mt-3 text-sm">Endereço mockado para demonstração:</p>
            <p className="mt-2 break-all bg-black/25 p-2 text-sm font-semibold">
              {MOCK_SERVER.ip}
            </p>
          </div>
        </Container>
        <div className="border-t-4 border-black/25">
          <Container className="py-4">
            <p className="text-xs text-parchment/70">
              © 2026 Habblet Mine. Conteúdo ilustrativo — dados de exemplo.
            </p>
          </Container>
        </div>
      </div>
    </footer>
  );
}
