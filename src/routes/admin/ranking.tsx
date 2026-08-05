import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/AdminTable";
import { 
  adminListAllRankings, 
  adminClearDemoRankings,
  adminListServers,
  adminUpdateServerConfig
} from "@/lib/services/admin-ranking.functions";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { RefreshCw, Trash2, Server, Trophy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/admin/ranking")({
  component: AdminRankingPage,
});

function AdminRankingPage() {
  const queryClient = useQueryClient();
  
  const { data: rankings } = useSuspenseQuery({
    queryKey: ["admin-rankings"],
    queryFn: () => adminListAllRankings({ data: {} }),
  });

  const { data: servers } = useSuspenseQuery({
    queryKey: ["admin-servers"],
    queryFn: () => adminListServers(),
  });

  const clearDemoMutation = useMutation({
    mutationFn: useServerFn(adminClearDemoRankings),
    onSuccess: () => {
      toast.success("Dados demonstrativos limpos!");
      queryClient.invalidateQueries({ queryKey: ["admin-rankings"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const columns = [
    { header: "Posição", accessorKey: "position" as const },
    { header: "Nickname", accessorKey: "minecraft_nickname" as const },
    { header: "Categoria", accessorKey: "category" as const },
    { header: "Período", accessorKey: "period" as const },
    { header: "Valor", accessorKey: "display_value" as const },
    { 
      header: "Atualizado", 
      accessorKey: "updated_at" as const,
      cell: (row: any) => new Date(row.updated_at).toLocaleString('pt-BR')
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-xl uppercase">Rankings e Status</h1>
        <div className="flex gap-2">
          <PixelButton 
            variant="stone" 
            onClick={() => clearDemoMutation.mutate({})}
            disabled={clearDemoMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar Dados Demo
          </PixelButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status dos Servidores */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-pixel text-sm uppercase flex items-center gap-2">
            <Server className="h-4 w-4" /> Servidores
          </h2>
          {servers.map(server => (
            <StonePanel key={server.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{server.server_id}</span>
                <span className={server.online ? "text-emerald-block" : "text-destructive"}>
                  {server.online ? "Online" : "Offline"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>IP: {server.ip}</p>
                <p>Versão: {server.version}</p>
                <p>Jogadores: {server.players_online}/{server.max_players}</p>
                <p className="mt-2 text-[10px] uppercase border-t border-dirt-dark/10 pt-1">
                  Último Sinal: {new Date(server.updated_at).toLocaleTimeString()}
                </p>
              </div>
            </StonePanel>
          ))}
          
          <div className="pixel-border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-600 flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>O heartbeat é enviado automaticamente pelo plugin AvanceMine-Core a cada 30 segundos.</p>
          </div>
        </div>

        {/* Lista Geral de Rankings */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-pixel text-sm uppercase flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Top Jogadores
          </h2>
          <AdminTable 
            data={rankings} 
            columns={columns} 
            onSearch={(val) => console.log('Search:', val)}
          />
        </div>
      </div>
    </div>
  );
}
