import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { listMinecraftServers, listDeliveryQueue } from '@/lib/services/admin-minecraft.functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Send, ShieldCheck, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/admin/minecraft')({
  component: AdminMinecraftPage,
});

function AdminMinecraftPage() {
  const { data: servers, isLoading: loadingServers } = useQuery({
    queryKey: ['admin', 'minecraft', 'servers'],
    queryFn: () => listMinecraftServers(),
  });

  const { data: queue, isLoading: loadingQueue } = useQuery({
    queryKey: ['admin', 'minecraft', 'queue'],
    queryFn: () => listDeliveryQueue(),
  });

  return (
    <AdminLayout title="Integração Minecraft">
      <div className="space-y-6">
        {/* Diagnóstico Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                API Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">Saudável</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2">
                <Server className="w-4 h-4" />
                Servidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {loadingServers ? "..." : servers?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Fila Pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">
                {loadingQueue ? "..." : queue?.filter(d => d.status === 'queued').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-rose-500/5 border-rose-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-rose-500 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Falhas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">
                {loadingQueue ? "..." : queue?.filter(d => d.status === 'failed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="servers" className="w-full">
          <TabsList className="bg-background/50 border border-border/50 p-1">
            <TabsTrigger value="servers" className="gap-2 font-pixel text-[9px] uppercase">
              <Server className="w-4 h-4" />
              Servidores
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-2 font-pixel text-[9px] uppercase">
              <Send className="w-4 h-4" />
              Fila de Entregas
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 font-pixel text-[9px] uppercase">
              <ShieldCheck className="w-4 h-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="mt-6">
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-border/40 bg-muted/30">
                      <tr>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">ID / Nome</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Ambiente</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Status</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Jogadores</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Último Heartbeat</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Versão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {loadingServers ? (
                        Array(3).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={6} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                          </tr>
                        ))
                      ) : (
                        servers?.map((server: any) => (
                          <tr key={server.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-sm">{server.display_name}</div>
                              <div className="text-[10px] text-muted-foreground">{server.server_id}</div>
                            </td>
                            <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-wider">
                              <Badge variant="outline" className={
                                server.environment === 'production' ? 'border-emerald-500/50 text-emerald-500' : 'border-amber-500/50 text-amber-500'
                              }>
                                {server.environment}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={server.enabled ? "default" : "destructive"} className="text-[10px] uppercase">
                                {server.enabled ? "Ativo" : "Inativo"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono">
                              {server.server_status?.online_players || 0} / {server.server_status?.max_players || 0}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {server.server_status?.last_seen_at ? new Date(server.server_status.last_seen_at).toLocaleString() : 'Nunca'}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono">
                              {server.server_status?.minecraft_version || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-border/40 bg-muted/30">
                      <tr>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Entrega ID</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Status</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Tentativas</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Servidor</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase">Criado em</th>
                        <th className="px-6 py-4 font-pixel text-[9px] uppercase text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {loadingQueue ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={6} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                          </tr>
                        ))
                      ) : (
                        queue?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-mono text-xs">{item.id.slice(0, 13)}...</div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{item.command}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={
                                item.status === 'delivered' ? 'default' :
                                item.status === 'failed' ? 'destructive' : 'secondary'
                              } className="capitalize text-[10px]">
                                {item.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono">{item.attempts} / 10</td>
                            <td className="px-6 py-4 text-xs font-mono">{item.server_id}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Activity className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-border/40 bg-card/30">
                 <CardHeader>
                   <CardTitle className="font-pixel text-[12px] uppercase">Nova Instância</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">Cadastre um novo servidor Minecraft autorizado.</p>
                   <Button className="font-pixel text-[10px] uppercase w-full bg-emerald-block hover:bg-emerald-600 pixel-border">
                     Gerar Credenciais
                   </Button>
                 </CardContent>
               </Card>
               
               <Card className="border-border/40 bg-card/30">
                 <CardHeader>
                   <CardTitle className="font-pixel text-[12px] uppercase">Gestão de Segredos</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">Segredos são armazenados em hash e nunca exibidos novamente.</p>
                   <Button variant="outline" className="font-pixel text-[10px] uppercase w-full pixel-border">
                     Ver Auditoria de Segurança
                   </Button>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

