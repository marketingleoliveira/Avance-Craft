import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Container central de 1180px máximo. */
export function Container({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {

  return (
    <div 
      id={id}
      className={cn("mx-auto w-full max-w-[1180px] px-4 sm:px-6", className)}
    >
      {children}
    </div>
  );
}

