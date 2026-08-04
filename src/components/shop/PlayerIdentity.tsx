import { StonePanel } from "@/components/ui-kit/StonePanel";
import { cn } from "@/lib/utils";
import { useCart } from "./CartContext";
import { validateNickname } from "@/lib/payments/checkout-service";

const platforms = [
  { id: "java", label: "Java" },
  { id: "bedrock", label: "Bedrock" },
] as const;

/** Identificação do jogador: nick obrigatório + plataforma. */
export function PlayerIdentity() {
  const { nickname, setNickname, platform, setPlatform, confirmed, setConfirmed } =
    useCart();
  const error = nickname.trim() ? validateNickname(nickname, platform) : null;

  return (
    <StonePanel title="1. Identifique-se">
      <label
        htmlFor="shop-nickname"
        className="font-pixel block text-[10px] uppercase text-grass-dark"
      >
        Seu nick no jogo *
      </label>
      <input
        id="shop-nickname"
        value={nickname}
        onChange={(event) => setNickname(event.target.value.slice(0, 24))}
        placeholder={platform === "java" ? "Ex.: Bloquinho_BR" : "Ex.: Bloquinho BR"}
        aria-invalid={Boolean(error)}
        aria-describedby="shop-nickname-help"
        className="pixel-border border-dirt-dark mt-2 w-full bg-background px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-emerald-block"
      />
      <p id="shop-nickname-help" className="mt-2 text-xs text-muted-foreground">
        {error ?? "Os itens são entregues exatamente para o nick informado."}
      </p>

      <fieldset className="mt-4">
        <legend className="font-pixel text-[10px] uppercase text-grass-dark">
          Plataforma
        </legend>
        <div className="mt-2 flex gap-2">
          {platforms.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={platform === item.id}
              onClick={() => setPlatform(item.id)}
              className={cn(
                "font-pixel pixel-border flex-1 px-3 py-2 text-[10px] uppercase transition-colors",
                platform === item.id
                  ? "border-grass-dark bg-grass text-primary-foreground"
                  : "border-stone-dark bg-stone/40 text-foreground hover:bg-stone/60",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 flex items-start gap-2 text-xs font-semibold">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="accent-grass mt-0.5 h-4 w-4"
        />
        Confirmo que <span className="underline">{nickname.trim() || "meu nick"}</span> é
        o meu nick correto na edição {platform === "java" ? "Java" : "Bedrock"}.
      </label>
    </StonePanel>
  );
}
