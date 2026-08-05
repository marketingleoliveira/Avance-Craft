import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      ref={ref as any}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-md text-card-foreground shadow-premium transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-500/20 hover:-translate-y-1 group",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        "after:absolute after:inset-0 after:glass-reflection after:opacity-0 group-hover:after:opacity-100 after:transition-opacity pointer-events-none",
        className
      )}
      {...(props as any)}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-xl font-[900] uppercase italic tracking-wider group-hover:text-emerald-400 transition-colors", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
