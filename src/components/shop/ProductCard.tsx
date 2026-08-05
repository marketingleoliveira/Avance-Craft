import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { formatBRL } from "@/lib/utils/format";
import { ProductArt } from "./ProductArt";

type Props = {
  product: any;
  onBuy: (product: any) => void;
};

export function ProductCard({ product, onBuy }: Props) {
  return (
    <StonePanel title={product.badge ?? "Produto"} className="h-full">
      <div className="flex h-full flex-col">
        <ProductArt index={product.art} name={product.name} />
        <h3 className="font-pixel mt-4 text-[12px] uppercase text-grass-dark">
          {product.name}
        </h3>
        <p className="mt-2 text-sm">{product.shortDescription}</p>

        <ul className="mt-3 grid gap-1.5 text-sm">
          {product.perks.slice(0, 3).map((perk: string) => (
            <li key={perk} className="flex items-start gap-2">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs font-bold uppercase text-muted-foreground">
          Validade: {product.duration} · {product.platforms.map((p: any) => (p === "java" ? "Java" : "Bedrock")).join(" e ")}
        </p>

        <div className="mt-auto pt-4">
          {product.previousPriceCents ? (
            <p className="text-sm font-bold text-muted-foreground line-through">
              {formatBRL(product.previousPriceCents)}
            </p>
          ) : null}
          <p className="text-2xl font-black">{formatBRL(product.priceCents)}</p>

          <div className="mt-4 grid gap-2">
            <PixelButton variant="grass" onClick={() => onBuy(product)}>
              Adicionar ao carrinho
            </PixelButton>
          </div>
        </div>
      </div>
    </StonePanel>
  );
}
