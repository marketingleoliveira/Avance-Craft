import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_SHOP } from "@/data/mock";

export function ShopHighlight() {
  return (
    <section className="bg-dirt/15 border-y-4 border-dirt-dark py-14">
      <Container>
        <WoodSign subtitle="Vitrine ilustrativa. Nenhum pagamento está habilitado.">
          Loja
        </WoodSign>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MOCK_SHOP.map((item) => (
            <StonePanel key={item.id} title={item.tag}>
              <h3 className="font-pixel text-[12px] uppercase text-grass-dark">
                {item.name}
              </h3>
              <p className="mt-3 text-2xl font-black">{item.price}</p>
              <ul className="mt-4 grid gap-2 text-sm">
                {item.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block" aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link to="/loja" className="mt-5 block">
                <PixelButton variant="grass" className="w-full">
                  Ver detalhes
                </PixelButton>
              </Link>
            </StonePanel>
          ))}
        </div>
      </Container>
    </section>
  );
}
