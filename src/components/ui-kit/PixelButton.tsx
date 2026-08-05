import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: ButtonProps['variant'] | 'emerald' | 'grass' | 'wood' | 'stone';
}

/**
 * REBRANDING: PixelButton agora é o Button AAA com mapeamento de variants legadas.
 */
export function PixelButton({ className, variant, ...props }: PixelButtonProps) {
  // Mapeamento de variants do tema antigo para o novo sistema AAA
  const variantMap: Record<string, ButtonProps["variant"]> = {
    emerald: "default",
    grass: "default",
    wood: "secondary",
    stone: "outline",
  };

  const newVariant = (variant && variantMap[variant as string]) || (variant as ButtonProps["variant"]);

  return (
    <Button 
      variant={newVariant}
      className={cn("h-14 px-10 rounded-2xl", className)} 
      {...props} 
    />
  );
}
