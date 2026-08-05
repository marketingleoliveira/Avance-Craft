import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { adminListNewsCategories } from "@/lib/services/admin-content.functions";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { StonePanel } from "@/components/ui-kit/StonePanel";

export const Route = createFileRoute("/admin/noticias/categorias")({
  component: AdminNewsCategories,
});

function AdminNewsCategories() {
  const navigate = useNavigate();

  const { data: categories } = useSuspenseQuery({
    queryKey: ["admin-news-categories"],
    queryFn: () => adminListNewsCategories(),
  });

  const columns = [
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
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate({ to: "/admin/noticias" })}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="font-pixel text-xl uppercase text-foreground">Categorias de Notícias</h2>
            <p className="text-sm text-muted-foreground">Organize as publicações do blog por tópicos.</p>
          </div>
        </div>
        <Button 
          className="font-pixel text-[9px] uppercase bg-emerald-block hover:bg-emerald-block/90 pixel-border border-grass-dark"
          onClick={() => console.log("New category")}
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
        />
      </StonePanel>
    </div>
  );
}
