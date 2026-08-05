import { useState } from "react";
import { toast } from "sonner";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { formatBRL } from "@/lib/utils/format";
import { validateNickname } from "@/lib/payments/checkout-service";
import { useCart } from "./CartContext";
import { createPaymentPreference } from "@/lib/services/checkout.functions";
import { useServerFn } from "@tanstack/react-start";

/** Carrinho lateral (sticky no desktop). */
export function CartPanel() {
  const cart = useCart();
  const [pending, setPending] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptRefund, setAcceptRefund] = useState(false);
  const startCheckout = useServerFn(createPaymentPreference);


  async function handleCheckout(): Promise<void> {
    const nickError = validateNickname(cart.nickname, cart.platform);
    if (nickError) {
      toast.error(nickError);
      return;
    }
    if (!cart.confirmed) {
      toast.error("Confirme que o nick informado está correto.");
      return;
    }
    if (!acceptTerms || !acceptRefund) {
      toast.error("Você precisa aceitar os termos e a política de reembolso para continuar.");
      return;
    }

    if (cart.detailed.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    setPending(true);
    try {
      const result = await startCheckout({
        data: {
          nickname: cart.nickname.trim(),
          edition: cart.platform,
          items: cart.detailed.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          couponCode: cart.appliedCoupon,
        }
      });

      if (result.checkoutUrl) {
        if (result.isMock) {
          toast.info("Ambiente de teste: Redirecionando para sucesso mockado.");
        }
        window.location.assign(result.checkoutUrl);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Erro ao iniciar pagamento. Verifique se você está logado.");
    } finally {
      setPending(false);
    }
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
          onClick={async () => {
            const success = await cart.applyCoupon();
            if (success) {
              toast.success("Cupom aplicado.");
            } else {
              toast.error("Cupom inválido ou não atende aos requisitos.");
            }
          }}
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

      <div className="mt-6 space-y-3 bg-black/5 p-3 rounded pixel-border border-black/10">

        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-black/20 text-emerald-block focus:ring-emerald-block/50"
          />
          <span className="text-[10px] leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
            Li e aceito os <Link to="/termos" className="underline font-bold text-emerald-block">Termos de Compra</Link> e <Link to="/regras" className="underline font-bold text-emerald-block">Regras do Servidor</Link>.
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={acceptRefund}
            onChange={(e) => setAcceptRefund(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-black/20 text-emerald-block focus:ring-emerald-block/50"
          />
          <span className="text-[10px] leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
            Compreendo que produtos digitais possuem regras específicas de <Link to="/reembolso" className="underline font-bold text-emerald-block">Reembolso</Link>.
          </span>
        </label>
      </div>

      <PixelButton

        variant="emerald"
        className="mt-4 w-full"
        disabled={pending}
        onClick={handleCheckout}
      >
        {pending ? "Verificando..." : "Ir para pagamento"}
      </PixelButton>
      <p className="mt-2 text-xs text-muted-foreground">
        Em ambiente de desenvolvimento, o checkout redireciona para uma confirmação simulada.
      </p>

    </StonePanel>
  );
}
