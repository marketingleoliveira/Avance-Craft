import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import wood from "@/assets/tex-wood.jpg";

type Props = {
  children: ReactNode;
  subtitle?: string;
  className?: string;
};

/** Placa de madeira usada como título de seção. */
export function WoodSign({ children, subtitle, className }: Props) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="flex gap-16">
        <span className="h-5 w-3 bg-wood-dark" />
        <span className="h-5 w-3 bg-wood-dark" />
      </div>
      <div
        className="pixel-border pixel-shadow border-wood-dark relative px-6 py-4 text-center sm:px-10"
        style={{
          backgroundImage: `url(${wood})`,
          backgroundSize: "220px",
          imageRendering: "pixelated",
        }}
      >
        <h2 className="font-pixel text-[13px] uppercase text-dirt-dark sm:text-base">
          {children}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-sm font-medium text-dirt-dark/80">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
