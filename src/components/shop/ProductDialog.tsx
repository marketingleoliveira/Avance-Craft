import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { formatBRL } from "@/lib/utils/format";
import { ProductArt } from "./ProductArt";

type Props = {
  product: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: any, quantity: number) => void;
};


/** Detalhe do produto: galeria, descrição completa, comandos e quantidade. */
export function ProductDialog({ product, open, onOpenChange, onAdd }: Props) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open, product?.id]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-border border-dirt-dark bg-parchment max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-pixel text-[13px] uppercase text-grass-dark">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            {product.fullDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-3">
          {[0, 1, 2].map((offset) => (
            <ProductArt
              key={offset}
              index={(product.art + offset) % 3}
              name={product.name}
              className="h-24"
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-pixel text-[10px] uppercase text-grass-dark">Vantagens</h4>
            <ul className="mt-2 grid gap-1.5 text-sm">
              {product.perks.map((perk: any) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-emerald-block" aria-hidden />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-pixel text-[10px] uppercase text-grass-dark">Comandos</h4>
            <ul className="mt-2 grid gap-1.5 font-mono text-sm">
              {product.commands.map((command: any) => (
                <li key={command} className="bg-stone/30 px-2 py-1">
                  {command}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">Duração</dt>
            <dd className="font-semibold">{product.duration}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">
              Compatibilidade
            </dt>
            <dd className="font-semibold">
              {product.platforms.map((p: any) => (p === "java" ? "Java" : "Bedrock")).join(" e ")}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          Ao adquirir você concorda com os termos de compra: itens virtuais, entrega
          vinculada ao nick informado e reembolso em até 7 dias caso os benefícios não
          tenham sido usados. Nesta versão nenhuma cobrança é realizada.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="pixel-border border-dirt-dark flex items-center bg-background">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="px-3 py-2 font-bold"
            >
              −
            </button>
            <span className="w-10 text-center font-bold" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantity((value) => Math.min(99, value + 1))}
              className="px-3 py-2 font-bold"
            >
              +
            </button>
          </div>
          <p className="text-xl font-black">{formatBRL(product.priceCents * quantity)}</p>
          <PixelButton
            variant="grass"
            className="ml-auto"
            onClick={() => {
              onAdd(product, quantity);
              onOpenChange(false);
            }}
          >
            Adicionar ao carrinho
          </PixelButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
