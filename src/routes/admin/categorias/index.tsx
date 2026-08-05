import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminListCategories, adminDeleteCategory } from "@/lib/services/admin.functions";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Tag, Eye, EyeOff } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { StonePanel } from "@/components/ui-kit/StonePanel";

export const Route = createFileRoute("/admin/categorias/")({
  component: AdminCategories,
});

function AdminCategories() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: categories } = useSuspenseQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminListCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteCategory({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria excluída com sucesso.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir categoria.");
    }
  });

  const columns = [
    {
      header: "Ícone",
      accessorKey: "icon",
      cell: (row: any) => (
        <div className="h-8 w-8 bg-stone-dark/10 rounded flex items-center justify-center pixel-border border-stone-dark/20 overflow-hidden">
          {row.icon ? (
            <img src={row.icon} alt={row.name} className="h-full w-full object-cover" />
          ) : (
            <Tag className="h-4 w-4 text-stone-dark/40" />
          )}
        </div>
      )
    },
    {
      header: "Nome",
      accessorKey: "name",
      cell: (row: any) => (
        <div>
          <p className="font-bold">{row.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{row.slug}</p>
        </div>
      )
    },
    {
      header: "Posição",
      accessorKey: "position",
      cell: (row: any) => (
        <span className="font-mono bg-stone-dark/5 px-2 py-0.5 rounded text-xs">
          {row.position}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.active ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Eye className="h-3 w-3" />
              <span className="font-pixel text-[8px] uppercase">Ativo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <EyeOff className="h-3 w-3" />
              <span className="font-pixel text-[8px] uppercase">Inativo</span>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-xl uppercase text-foreground">Categorias</h2>
          <p className="text-sm text-muted-foreground">Gerencie as categorias de produtos da sua loja.</p>
        </div>
        <Button 
          className="font-pixel text-[9px] uppercase bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark"
          onClick={() => navigate({ to: "/admin/categorias/new" })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <StonePanel>
        <AdminTable
          columns={columns}
          data={categories}
          onSearch={(val) => console.log("Search:", val)}
          actions={(row: any) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-pixel text-[9px] uppercase">
                <DropdownMenuItem onClick={() => navigate({ to: `/admin/categorias/${row.id}/edit` })}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm("Deseja realmente excluir esta categoria?")) {
                      deleteMutation.mutate(row.id);
                    }
                  }}
                >
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