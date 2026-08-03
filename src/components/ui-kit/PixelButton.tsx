import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "grass" | "wood" | "stone" | "emerald";

const variants: Record<Variant, string> = {
  grass: "bg-grass text-primary-foreground border-grass-dark hover:bg-grass/90",
  wood: "bg-wood text-secondary-foreground border-wood-dark hover:bg-wood/90",
  stone: "bg-stone text-foreground border-stone-dark hover:bg-stone/90",
  emerald:
    "bg-emerald-block text-accent-foreground border-grass-dark hover:bg-emerald-block/90",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function PixelButton({ variant = "grass", className, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={cn(
        "font-pixel pixel-border pixel-shadow inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] uppercase transition-transform active:translate-y-[3px] active:shadow-none",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
