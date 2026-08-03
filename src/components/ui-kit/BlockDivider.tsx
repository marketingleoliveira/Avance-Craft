import grassDirt from "@/assets/tex-grass-dirt.jpg";
import { cn } from "@/lib/utils";

/** Faixa decorativa de blocos de grama/terra. */
export function BlockDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-10 w-full border-y-4 border-dirt-dark", className)}
      style={{
        backgroundImage: `url(${grassDirt})`,
        backgroundSize: "40px",
        imageRendering: "pixelated",
      }}
    />
  );
}
