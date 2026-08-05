import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { adminListNews } from "@/lib/services/admin-content.functions";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Newspaper, Eye, EyeOff, Calendar, Star } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/noticias/")({
  component: AdminNewsList,
});

function AdminNewsList() {
  const navigate = useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ["admin-news"],
    queryFn: () => adminListNews({ data: { limit: 50 } }),
  });

  const columns = [
    {
      header: "Imagem",
      accessorKey: "image_url",
      cell: (row: any) => (
        <div className="h-10 w-16 bg-stone-dark/10 rounded flex items-center justify-center pixel-border border-stone-dark/20 overflow-hidden">
          {row.image_url ? (
            <img src={row.image_url} alt={row.title} className="h-full w-full object-cover" />
          ) : (
            <Newspaper className="h-4 w-4 text-stone-dark/40" />
          )}
        </div>
      )
    },
    {
      header: "Título",
      accessorKey: "title",
      cell: (row: any) => (
        <div className="max-w-[300px]">
          <div className="flex items-center gap-2">
            <p className="font-bold truncate">{row.title}</p>
            {row.featured && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase">{row.slug}</p>
        </div>
      )
    },
    {
      header: "Categoria",
      accessorKey: "category",
      cell: (row: any) => (
        <span className="bg-stone-dark/5 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
          {row.category?.name || "Sem categoria"}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => {
        const statusMap: Record<string, { label: string; color: string; icon: any }> = {
          draft: { label: "Rascunho", color: "text-muted-foreground", icon: EyeOff },
          published: { label: "Publicado", color: "text-emerald-600", icon: Eye },
          scheduled: { label: "Agendado", color: "text-blue-500", icon: Calendar },
          archived: { label: "Arquivado", color: "text-destructive", icon: Trash2 },
        };
        const config = statusMap[row.status] || statusMap["draft"];
        const Icon = config.icon;
        
        return (
          <div className={cn("flex items-center gap-1.5", config.color)}>
            <Icon className="h-3 w-3" />
            <span className="font-pixel text-[8px] uppercase">{config.label}</span>
          </div>
        );
      }
    },
    {
      header: "Data",
      accessorKey: "published_at",
      cell: (row: any) => (
        <span className="text-xs text-muted-foreground">
          {row.published_at ? new Date(row.published_at).toLocaleDateString('pt-BR') : '-'}
        </span>
      )
    }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-xl uppercase text-foreground">Notícias</h2>
          <p className="text-sm text-muted-foreground">Gerencie o blog e os comunicados do servidor.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="font-pixel text-[9px] uppercase pixel-border"
            onClick={() => navigate({ to: "/admin/noticias/categorias" })}
          >
            Categorias
          </Button>
          <Button 
            className="font-pixel text-[9px] uppercase bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark"
            onClick={() => navigate({ to: "/admin/noticias/new" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Notícia
          </Button>
        </div>
      </div>

      <StonePanel>
        <AdminTable
          columns={columns}
          data={data.news}
          pagination={{
            pageIndex: 0,
            pageSize: 50,
            totalCount: data.count,
            onPageChange: (idx) => console.log("Page change:", idx)
          }}
          onSearch={(val) => console.log("Search:", val)}
          actions={(row: any) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-pixel text-[9px] uppercase">
                <DropdownMenuItem onClick={() => navigate({ to: `/admin/noticias/${row.id}/edit` as any })}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </StonePanel>
    </div>
  );
}
