import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface WoodSignProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
}

/** 
 * REBRANDING: Substituído estilo madeira por tipografia AAA.
 * Mantido o nome para compatibilidade durante a migração.
 */
export function WoodSign({ children, subtitle, className }: WoodSignProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <motion.span 
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]"
      >
        {subtitle || "Avance Experience"}
      </motion.span>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl md:text-6xl font-[900] uppercase italic tracking-tighter text-white leading-tight"
      >
        {children}
      </motion.h2>
    </div>
  );
}
