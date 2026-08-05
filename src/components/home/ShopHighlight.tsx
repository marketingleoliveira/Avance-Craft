import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatBRL } from "@/lib/utils/format";

import chests from "@/assets/vip-chests.png";

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
        style={{ transform: `translateX(-${(index % 3) * 33.3333}%)` }}
      />
    </div>
  );
}

export function ShopHighlight({ products }: { products: any[] }) {


  return (
    <section className="bg-dirt/15 border-b-4 border-dirt-dark py-14">
      <Container>
        <WoodSign subtitle="Confira nossos pacotes VIP em destaque.">Loja Destaque</WoodSign>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((product: any, index: number) => (
            <StonePanel key={product.id} title={product.category?.name}>
              <ChestImage index={index} name={product.name} />
              <h3 className="font-pixel mt-4 text-[12px] uppercase text-grass-dark">
                {product.name}
              </h3>
              <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                Duração: {product.duration_days ? `${product.duration_days} dias` : "Permanente"}
              </p>
              <ul className="mt-4 grid gap-2 text-sm">
                {product.benefits?.slice(0, 3).map((benefit: any) => (
                  <li key={benefit.id} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block"
                      aria-hidden
                    />
                    {benefit.description}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-2xl font-black">{formatBRL(Math.round(product.price * 100))}</p>
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
