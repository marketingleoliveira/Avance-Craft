import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import stone from "@/assets/tex-stone.jpg";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** Painel com moldura de pedra e corpo em tom bege claro. */
export function StonePanel({ title, children, className, bodyClassName }: Props) {
  return (
    <section
      className={cn("pixel-border border-stone-dark pixel-shadow p-2", className)}
      style={{
        backgroundImage: `url(${stone})`,
        backgroundSize: "120px",
        imageRendering: "pixelated",
      }}
    >
      {title ? (
        <header className="bg-dirt-dark/85 mb-2 px-3 py-2">
          <h3 className="font-pixel text-[11px] uppercase text-parchment">{title}</h3>
        </header>
      ) : null}
      <div className={cn("bg-parchment/95 p-4 text-foreground sm:p-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
