import { cn } from "@/lib/utils";

/**
 * REBRANDING: BlockDivider agora é uma linha sutil AAA.
 */
export function BlockDivider({ className }: { className?: string }) {
  return (
    <div className={cn("h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12", className)} />
  );
}
