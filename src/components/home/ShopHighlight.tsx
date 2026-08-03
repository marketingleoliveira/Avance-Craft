import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { MOCK_SHOP } from "@/data/mock";
/** Placeholder original: baús voxel (bronze, ouro, esmeralda). */
import chests from "@/assets/vip-chests.png";

/** Recorta um dos três baús da imagem em tira. */
function ChestImage({ index, name }: { index: number; name: string }) {
  return (
    <div className="pixel-border border-dirt-dark bg-sky-block/15 relative h-28 overflow-hidden">
      <img
        src={chests}
        alt={`Baú voxel representando o ${name}`}
        width={1536}
        height={640}
        loading="lazy"
        className="absolute left-0 top-0 h-full w-[300%] max-w-none object-cover"
        style={{ transform: `translateX(-${index * 33.3333}%)` }}
      />
    </div>
  );
}

export function ShopHighlight() {
  return (
    <section className="bg-dirt/15 border-b-4 border-dirt-dark py-14">
      <Container>
        <WoodSign subtitle="Vitrine ilustrativa. Nenhum pagamento está habilitado.">
          Loja
        </WoodSign>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MOCK_SHOP.map((item, index) => (
            <StonePanel key={item.id} title={item.tag}>
              <ChestImage index={index} name={item.name} />
              <h3 className="font-pixel mt-4 text-[12px] uppercase text-grass-dark">
                {item.name}
              </h3>
              <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                Período: {item.period}
              </p>
              <ul className="mt-4 grid gap-2 text-sm">
                {item.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block"
                      aria-hidden
                    />
                    {perk}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-2xl font-black">{item.price}</p>
              <Link to="/loja" className="mt-4 block">
                <PixelButton variant="grass" className="w-full">
                  Comprar
                </PixelButton>
              </Link>
            </StonePanel>
          ))}
        </div>
      </Container>
    </section>
  );
}
