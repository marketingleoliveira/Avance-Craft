import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StonePanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * REBRANDING: StonePanel agora é um Card AAA.
 * Mantido para compatibilidade.
 */
export function StonePanel({ title, children, className, bodyClassName }: StonePanelProps) {
  return (
    <Card className={cn("p-0", className)}>
      {title && (
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 italic">
            {title}
          </h3>
        </div>
      )}
      <div className={cn("p-8", bodyClassName)}>
        {children}
      </div>
    </Card>
  );
}
