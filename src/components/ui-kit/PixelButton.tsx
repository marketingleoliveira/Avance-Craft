import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * REBRANDING: PixelButton agora é o Button AAA.
 */
export function PixelButton({ className, ...props }: ButtonProps) {
  return (
    <Button 
      className={cn("h-14 px-10 rounded-2xl", className)} 
      {...props} 
    />
  );
}
