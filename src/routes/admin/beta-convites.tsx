import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  adminListBetaInvites, 
  adminCreateBetaInvite, 
  adminListBetaParticipants, 
  adminUpdateParticipantStatus 
} from "@/lib/services/beta.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { Container } from "@/components/ui-kit/Container";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { 
  Ticket, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Calendar,
  Zap,
  Tag
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/beta-convites")({
  component: AdminBetaManager,
});

function AdminBetaManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'invites' | 'participants'>('invites');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Funções do servidor
  const listInvites = useServerFn(adminListBetaInvites);
  const createInvite = useServerFn(adminCreateBetaInvite);
  const listParticipants = useServerFn(adminListBetaParticipants);
  const updateStatus = useServerFn(adminUpdateParticipantStatus);

  const { data: invites, isLoading: loadingInvites } = useQuery({
    queryKey: ["admin-beta-invites"],
    queryFn: () => listInvites(),
  });

  const { data: participants, isLoading: loadingParticipants } = useQuery({
    queryKey: ["admin-beta-participants"],
    queryFn: () => listParticipants(),
  });

  const createMutation = useMutation({
    mutationFn: (vars: any) => createInvite({ data: vars }),
    onSuccess: () => {
      toast.success("Convite criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-beta-invites"] });
      setShowCreateModal(false);
    }
  });

  const statusMutation = useMutation({
    mutationFn: (vars: any) => updateStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["admin-beta-participants"] });
    }
  });

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <WoodSign className="mb-2">Beta Manager</WoodSign>
          <p className="text-muted-foreground">Controle de acesso ao Closed Beta e gestão de convites.</p>
        </div>
        <div className="flex gap-2">
          <PixelButton 
            className={`px-6 ${activeTab === 'invites' ? 'bg-orange-600' : 'bg-stone-700'}`}
            onClick={() => setActiveTab('invites')}
          >
            <Ticket className="w-4 h-4 mr-2" /> CONVITES
          </PixelButton>
          <PixelButton 
            className={`px-6 ${activeTab === 'participants' ? 'bg-blue-600' : 'bg-stone-700'}`}
            onClick={() => setActiveTab('participants')}
          >
            <Users className="w-4 h-4 mr-2" /> PARTICIPANTES
          </PixelButton>
        </div>
      </div>

      {activeTab === 'invites' ? (
        <div className="space-y-6">
          <StonePanel className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-pixel text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" /> CONVITES ATIVOS
              </h2>
              <PixelButton onClick={() => setShowCreateModal(true)} className="bg-emerald-600 h-8 text-[10px]">
                <Plus className="w-3 h-3 mr-1" /> NOVO CONVITE
              </PixelButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-700 text-[10px] font-pixel text-muted-foreground uppercase">
                    <th className="py-4 px-2">Código</th>
                    <th className="py-4 px-2">Campanha</th>
                    <th className="py-4 px-2 text-center">Usos</th>
                    <th className="py-4 px-2">Expiração</th>
                    <th className="py-4 px-2">Criado em</th>
                    <th className="py-4 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono">
                  {invites?.map((invite) => (
                    <tr key={invite.id} className="border-b border-stone-800/50 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-bold text-orange-400">{invite.code}</td>
                      <td className="py-4 px-2 text-gray-400">{invite.campaign || "-"}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={invite.uses_count >= invite.max_uses ? "text-red-500" : "text-green-500"}>
                          {invite.uses_count} / {invite.max_uses}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-500">
                        {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "Nunca"}
                      </td>
                      <td className="py-4 px-2 text-gray-500">
                        {new Date(invite.created_at || "").toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2">
                        <PixelButton className="bg-stone-700 h-6 text-[8px] px-2">REVOGAR</PixelButton>
                      </td>
                    </tr>
                  ))}
                  {invites?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground italic">Nenhum convite gerado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </StonePanel>
        </div>
      ) : (
        <div className="space-y-6">
          <StonePanel className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-pixel text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> LISTA DE ACESSO
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar Nickname..." 
                  className="bg-stone-900 border border-stone-700 pl-8 pr-4 py-1 text-[10px] font-pixel focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-700 text-[10px] font-pixel text-muted-foreground uppercase">
                    <th className="py-4 px-2">Participante</th>
                    <th className="py-4 px-2">Convite</th>
                    <th className="py-4 px-2">Status</th>
                    <th className="py-4 px-2">Registrado em</th>
                    <th className="py-4 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {participants?.map((p: any) => (
                    <tr key={p.id} className="border-b border-stone-800/50 hover:bg-white/5">
                      <td className="py-4 px-2 flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-800 rounded-sm overflow-hidden flex items-center justify-center">
                          <img 
                            src={`https://mc-heads.net/avatar/${p.profiles?.minecraft_nickname || 'Steve'}/32`} 
                            alt="Skin"
                            className="w-6 h-6 pixelated"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white font-mono">{p.profiles?.minecraft_nickname || "Não vinculado"}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{p.profile_id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-[10px] font-pixel text-orange-400">{p.beta_invites?.code}</div>
                        <div className="text-[9px] text-gray-500">{p.beta_invites?.campaign}</div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          p.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' :
                          p.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                          p.status === 'blocked' ? 'bg-red-500/20 text-red-500' :
                          'bg-stone-700 text-stone-300'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-500 font-mono">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex gap-1">
                          {p.status === 'registered' && (
                            <PixelButton 
                              className="bg-emerald-600 h-6 text-[8px] px-2"
                              onClick={() => statusMutation.mutate({ id: p.id, status: 'approved' })}
                            >APROVAR</PixelButton>
                          )}
                          {p.status === 'approved' && (
                            <PixelButton 
                              className="bg-blue-600 h-6 text-[8px] px-2"
                              onClick={() => statusMutation.mutate({ id: p.id, status: 'active' })}
                            >ATIVAR</PixelButton>
                          )}
                          {p.status !== 'blocked' && (
                            <PixelButton 
                              className="bg-red-800 h-6 text-[8px] px-2"
                              onClick={() => statusMutation.mutate({ id: p.id, status: 'blocked' })}
                            >BANIR</PixelButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StonePanel>
        </div>
      )}

      {/* MODAL CRIAR CONVITE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <StonePanel className="w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-minecraft text-white mb-6">GERAR NOVO CONVITE</h2>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                code: fd.get('code'),
                max_uses: Number(fd.get('max_uses')),
                campaign: fd.get('campaign'),
              });
            }}>
              <div className="space-y-1">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">Código Personalizado:</label>
                <input name="code" required defaultValue={`BETA-${Math.random().toString(36).substring(7).toUpperCase()}`} className="w-full bg-stone-900 border border-stone-700 p-3 text-sm font-mono text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">Máximo de Usos:</label>
                <input name="max_uses" type="number" required defaultValue="1" className="w-full bg-stone-900 border border-stone-700 p-3 text-sm font-mono text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">Nome da Campanha:</label>
                <input name="campaign" placeholder="Ex: YouTubers-S1" className="w-full bg-stone-900 border border-stone-700 p-3 text-sm font-mono text-white outline-none focus:border-primary" />
              </div>

              <div className="flex gap-4 pt-4">
                <PixelButton type="button" variant="stone" className="flex-1" onClick={() => setShowCreateModal(false)}>CANCELAR</PixelButton>
                <PixelButton type="submit" className="flex-1 bg-emerald-600" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "GERANDO..." : "CRIAR CONVITE"}
                </PixelButton>
              </div>
            </form>
          </StonePanel>
        </div>
      )}
    </Container>
  );
}
