import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { formatBRL, type ShopProduct } from "@/data/shop";
import { ProductArt } from "./ProductArt";

type Props = {
  product: ShopProduct;
  onAdd: (product: ShopProduct) => void;
  onDetails: (product: ShopProduct) => void;
};

export function ProductCard({ product, onAdd, onDetails }: Props) {
  return (
    <StonePanel title={product.badge ?? "Produto"} className="h-full">
      <div className="flex h-full flex-col">
        <ProductArt index={product.art} name={product.name} />
        <h3 className="font-pixel mt-4 text-[12px] uppercase text-grass-dark">
          {product.name}
        </h3>
        <p className="mt-2 text-sm">{product.shortDescription}</p>

        <ul className="mt-3 grid gap-1.5 text-sm">
          {product.perks.slice(0, 3).map((perk) => (
            <li key={perk} className="flex items-start gap-2">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs font-bold uppercase text-muted-foreground">
          Validade: {product.duration} · {product.platforms.map((p) => (p === "java" ? "Java" : "Bedrock")).join(" e ")}
        </p>

        <div className="mt-auto pt-4">
          {product.previousPriceCents ? (
            <p className="text-sm font-bold text-muted-foreground line-through">
              {formatBRL(product.previousPriceCents)}
            </p>
          ) : null}
          <p className="text-2xl font-black">{formatBRL(product.priceCents)}</p>

          <div className="mt-4 grid gap-2">
            <PixelButton variant="grass" onClick={() => onAdd(product)}>
              Adicionar ao carrinho
            </PixelButton>
            <PixelButton variant="stone" onClick={() => onDetails(product)}>
              Ver detalhes
            </PixelButton>
          </div>
        </div>
      </div>
    </StonePanel>
  );
}
