import { Link } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Package, 
  Tags, 
  Ticket, 
  Newspaper, 
  Trophy, 
  Server, 
  Users, 
  LifeBuoy, 
  ShieldCheck, 
  History, 
  Settings,
  ChevronLeft,
  LogOut,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Pedidos", icon: ShoppingBag, to: "/admin/pedidos" },
  { label: "Pagamentos", icon: CreditCard, to: "/admin/pagamentos" },
  { label: "Entregas", icon: Truck, to: "/admin/entregas" },
  { type: "divider", label: "Catálogo" },
  { label: "Produtos", icon: Package, to: "/admin/produtos" },
  { label: "Categorias", icon: Tags, to: "/admin/categorias" },
  { label: "Cupons", icon: Ticket, to: "/admin/cupons" },
  { type: "divider", label: "Conteúdo" },
  { label: "Notícias", icon: Newspaper, to: "/admin/noticias" },
  { label: "Ranking", icon: Trophy, to: "/admin/ranking" },
  { label: "Servidores", icon: Server, to: "/admin/servidores" },
  { type: "divider", label: "Comunidade" },
  { label: "Jogadores", icon: Users, to: "/admin/jogadores" },
  { label: "Tickets", icon: LifeBuoy, to: "/admin/tickets" },
  { label: "Usuários", icon: ShieldCheck, to: "/admin/usuarios" },
  { type: "divider", label: "Sistema" },
  { label: "Auditoria", icon: History, to: "/admin/auditoria" },
  { label: "Configurações", icon: Settings, to: "/admin/configuracoes" },
];

export function AdminSidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("flex h-full flex-col bg-stone-dark text-parchment border-r-4 border-black/20", className)}>
      <div className="flex h-16 items-center border-b-4 border-black/20 px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-emerald-block pixel-border border-black/40" />
          <span className="font-pixel text-[10px] uppercase text-outline">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.3)_transparent]">
        <ul className="grid gap-1">
          {MENU_ITEMS.map((item, idx) => {
            if (item.type === "divider") {
              return (
                <li key={`div-${idx}`} className="mt-4 mb-1 px-2">
                  <span className="font-pixel text-[8px] uppercase text-parchment/40 tracking-wider">
                    {item.label}
                  </span>
                </li>
              );
            }

            const Icon = item.icon!;
            return (
              <li key={item.to}>
                <Link
                  to={item.to!}

                  activeProps={{ className: "bg-emerald-block text-accent-foreground border-grass-dark" }}
                  inactiveProps={{ className: "hover:bg-black/20 border-transparent" }}
                  className="font-pixel flex items-center gap-3 px-3 py-2.5 text-[9px] uppercase transition-colors pixel-border border-2"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t-4 border-black/20 p-4 grid gap-2">
        <Link to="/" className="contents">
          <Button variant="ghost" className="font-pixel w-full justify-start text-[9px] uppercase text-parchment hover:bg-black/20">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar ao site
          </Button>
        </Link>
        <Button variant="ghost" className="font-pixel w-full justify-start text-[9px] uppercase text-destructive hover:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
