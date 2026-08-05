import { LucideIcon } from "lucide-react";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function AdminStatCard({ label, value, icon: Icon, trend, className }: AdminStatCardProps) {
  return (
    <StonePanel bodyClassName="p-6" className={className || ""}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[8px] uppercase text-muted-foreground tracking-wider">{label}</p>
          <h3 className="mt-2 text-2xl font-black text-foreground">{value}</h3>
          
          {trend && (
            <p className={cn(
              "mt-2 flex items-center gap-1 text-[10px] font-bold",
              trend.positive ? "text-grass-dark" : "text-destructive"
            )}>
              {trend.positive ? "▲" : "▼"} {trend.value}
              <span className="text-muted-foreground font-normal ml-1">vs mês anterior</span>
            </p>
          )}
        </div>
        
        <div className="h-12 w-12 bg-stone-dark/10 pixel-border border-stone-dark/20 flex items-center justify-center text-stone-dark">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </StonePanel>
  );
}
