import { useState } from "react";
import { toast } from "sonner";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { formatBRL } from "@/data/shop";
import { createCheckout, validateNickname } from "@/lib/payments/checkout-service";
import { useCart } from "./CartContext";

/** Carrinho lateral (sticky no desktop). Nenhum pagamento é processado. */
export function CartPanel() {
  const cart = useCart();
  const [pending, setPending] = useState(false);

  async function handleCheckout() {
    const nickError = validateNickname(cart.nickname, cart.platform);
    if (nickError) return toast.error(nickError);
    if (!cart.confirmed) return toast.error("Confirme que o nick informado está correto.");
    if (cart.detailed.length === 0) return toast.error("Seu carrinho está vazio.");

    setPending(true);
    const result = await createCheckout({
      nickname: cart.nickname.trim(),
      platform: cart.platform,
      items: cart.detailed.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPriceCents: item.product.priceCents,
      })),
      ...(cart.appliedCoupon ? { coupon: cart.appliedCoupon } : {}),
      totalCents: cart.totalCents,
    });
    setPending(false);

    if (result.status === "unavailable") toast.info(result.message);
    else window.location.assign(result.url);
  }

  return (
    <StonePanel title={`Carrinho (${cart.count})`} className="lg:sticky lg:top-24">
      <p className="text-xs font-bold uppercase text-muted-foreground">Jogador</p>
      <p className="text-sm font-semibold">
        {cart.nickname.trim() || "Nick não informado"} ·{" "}
        {cart.platform === "java" ? "Java" : "Bedrock"}
      </p>

      <ul className="mt-4 grid gap-3">
        {cart.detailed.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            Nenhum item adicionado ainda.
          </li>
        ) : (
          cart.detailed.map(({ product, quantity }) => (
            <li key={product.id} className="border-b-2 border-stone-dark/40 pb-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold">{product.name}</span>
                <button
                  type="button"
                  onClick={() => cart.remove(product.id)}
                  className="text-xs font-bold uppercase text-destructive"
                >
                  Remover
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="pixel-border border-dirt-dark flex items-center bg-background">
                  <button
                    type="button"
                    aria-label={`Diminuir quantidade de ${product.name}`}
                    onClick={() => cart.setQuantity(product.id, quantity - 1)}
                    className="px-2.5 py-1 font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label={`Aumentar quantidade de ${product.name}`}
                    onClick={() => cart.setQuantity(product.id, quantity + 1)}
                    className="px-2.5 py-1 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-black">
                  {formatBRL(product.priceCents * quantity)}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4 flex gap-2">
        <input
          value={cart.coupon}
          onChange={(event) => cart.setCoupon(event.target.value.slice(0, 20))}
          placeholder="Cupom"
          aria-label="Cupom de desconto"
          className="pixel-border border-dirt-dark w-full bg-background px-3 py-2 text-sm font-semibold uppercase outline-none focus-visible:ring-2 focus-visible:ring-emerald-block"
        />
        <PixelButton
          variant="wood"
          onClick={() =>
            cart.applyCoupon()
              ? toast.success("Cupom aplicado.")
              : toast.error("Cupom inválido.")
          }
        >
          Aplicar
        </PixelButton>
      </div>

      <dl className="mt-4 grid gap-1 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="font-bold">{formatBRL(cart.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Desconto {cart.appliedCoupon ? `(${cart.appliedCoupon})` : ""}</dt>
          <dd className="font-bold">-{formatBRL(cart.discountCents)}</dd>
        </div>
        <div className="mt-1 flex justify-between border-t-2 border-stone-dark/40 pt-2 text-lg">
          <dt className="font-black">Total</dt>
          <dd className="font-black">{formatBRL(cart.totalCents)}</dd>
        </div>
      </dl>

      <PixelButton
        variant="emerald"
        className="mt-4 w-full"
        disabled={pending}
        onClick={handleCheckout}
      >
        {pending ? "Verificando..." : "Ir para pagamento"}
      </PixelButton>
      <p className="mt-2 text-xs text-muted-foreground">
        Pagamentos ainda não estão habilitados. Integração preparada para o Mercado Pago
        via backend.
      </p>
    </StonePanel>
  );
}
