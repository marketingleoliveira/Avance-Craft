import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBetaStatus, joinBeta } from "@/lib/services/beta.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { 
  Lock, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  MessageSquare, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Gamepad2,
  Ticket
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/beta")({
  component: BetaPage,
});

function BetaPage() {
  const [inviteCode, setInviteCode] = useState("");
  const fetchBetaStatus = useServerFn(getBetaStatus);
  const joinBetaFn = useServerFn(joinBeta);

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["beta-status"],
    queryFn: () => fetchBetaStatus(),
  });

  const mutation = useMutation({
    mutationFn: (code: string) => joinBetaFn({ data: { code } }),
    onSuccess: () => {
      toast.success("Convite resgatado com sucesso! Bem-vindo ao Beta.");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Falha ao validar convite.");
    }
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    mutation.mutate(inviteCode);
  };

  const statusMap = {
    registered: { label: "Inscrito", color: "text-blue-400", icon: Clock, desc: "Sua inscrição foi recebida e está aguardando revisão da equipe." },
    approved: { label: "Aprovado", color: "text-green-400", icon: CheckCircle2, desc: "Parabéns! Você foi aprovado. Siga as instruções abaixo para entrar." },
    active: { label: "Ativo", color: "text-emerald-500", icon: Zap, desc: "Acesso ativo. Você já pode jogar no servidor Beta." },
    invited: { label: "Convidado", color: "text-purple-400", icon: Ticket, desc: "Você recebeu um convite especial. Complete seu perfil." },
    blocked: { label: "Bloqueado", color: "text-red-500", icon: XCircle, desc: "Seu acesso ao beta foi suspenso por violação das regras." }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-[1180px]">
        {/* HERO SECTION */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
            <Lock className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Acesso Restrito</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-minecraft text-white mb-6 tracking-tight">
            Closed Beta <span className="text-blue-500">Program</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
            Participe da fundação do Avance. Teste novos sistemas, reporte bugs e ganhe recompensas exclusivas de pioneiro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LADO ESQUERDO: REGRAS E INFO */}
          <div className="lg:col-span-7 space-y-6">
            <StonePanel className="p-8">
              <h2 className="text-2xl font-minecraft text-blue-400 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6" />
                OBJETIVO DO TESTE
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>O Closed Beta é uma fase crítica onde validamos a estabilidade da nossa infraestrutura técnica e o balanceamento da economia.</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {[
                    "Stress-test do servidor Minecraft",
                    "Validação de novos sistemas de economia",
                    "Identificação de bugs críticos",
                    "Coleta de feedback da comunidade"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StonePanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StonePanel className="p-6 border-orange-500/20">
                <h3 className="text-lg font-minecraft text-orange-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  AVISO DE RESET
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  Todo o progresso in-game (itens, dinheiro, construções) poderá ser resetado ao final desta fase. Moedas compradas serão devolvidas em dobro no lançamento oficial.
                </p>
              </StonePanel>

              <StonePanel className="p-6 border-blue-500/20">
                <h3 className="text-lg font-minecraft text-blue-400 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  COMO REPORTAR
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  Utilize nosso canal exclusivo <strong>#beta-bugs</strong> no Discord ou abra um ticket de suporte marcando a categoria "Beta". Prints e logs são fundamentais.
                </p>
              </StonePanel>
            </div>

            <StonePanel className="p-8">
              <h3 className="text-xl font-minecraft text-white mb-6">POLÍTICAS DO BETA</h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-black/20 border border-white/5 rounded-sm">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">ECONOMIA DE TESTE</h4>
                    <p className="text-xs text-muted-foreground">Pagamentos reais estão desativados inicialmente. Utilize os vouchers de teste fornecidos no Discord.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-black/20 border border-white/5 rounded-sm">
                  <Gamepad2 className="w-8 h-8 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">WHITELIST ATIVA</h4>
                    <p className="text-xs text-muted-foreground">Apenas contas aprovadas no painel beta conseguirão se conectar ao servidor.</p>
                  </div>
                </div>
              </div>
            </StonePanel>
          </div>

          {/* LADO DIREITO: STATUS E FORMULÁRIO */}
          <div className="lg:col-span-5 space-y-6">
            <StonePanel className="p-8 border-blue-500/30 bg-blue-500/5">
              {!status ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-minecraft text-white mb-2">ENTRAR NO BETA</h2>
                    <p className="text-sm text-muted-foreground">Insira seu código de convite para começar.</p>
                  </div>

                  <form onSubmit={handleJoin} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="HAB-XXXX-XXXX"
                        className="w-full bg-black/60 border-2 border-white/10 p-4 text-center font-minecraft text-xl tracking-widest focus:border-blue-500/50 outline-none transition-all rounded-sm uppercase"
                      />
                    </div>
                    <PixelButton 
                      type="submit"
                      disabled={mutation.isPending || !inviteCode}
                      className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-500 border-blue-700"
                    >
                      {mutation.isPending ? "VALIDANDO..." : "RESGATAR CONVITE"}
                    </PixelButton>
                  </form>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-sm text-center">
                    <p className="text-[10px] text-muted-foreground italic">
                      Não tem um convite? Siga nossas redes sociais ou participe dos sorteios em nosso 
                      <a href="#" className="text-blue-400 ml-1 hover:underline">Discord</a>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-minecraft text-white mb-6">SUA INSCRIÇÃO</h2>
                    
                    <div className="relative inline-block mb-4">
                      <div className={`p-6 rounded-full border-2 ${statusMap[status.status as keyof typeof statusMap].color.replace('text-', 'border-')}/30 bg-black/40`}>
                        {(() => {
                          const Icon = statusMap[status.status as keyof typeof statusMap].icon;
                          return <Icon className={`w-12 h-12 ${statusMap[status.status as keyof typeof statusMap].color}`} />;
                        })()}
                      </div>
                    </div>
                    
                    <h3 className={`text-xl font-minecraft uppercase ${statusMap[status.status as keyof typeof statusMap].color}`}>
                      {statusMap[status.status as keyof typeof statusMap].label}
                    </h3>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
                    <p className="text-sm text-gray-300 text-center italic">
                      {statusMap[status.status as keyof typeof statusMap].desc}
                    </p>
                  </div>

                  {status.status === 'approved' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-xs font-minecraft text-white text-center">PRÓXIMOS PASSOS:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-3">
                          <span className="w-5 h-5 bg-green-500 text-black text-[10px] font-bold rounded flex items-center justify-center shrink-0">1</span>
                          <span className="text-xs text-green-200">Entre no nosso Discord e solicite o cargo <strong>@Beta-Tester</strong>.</span>
                        </div>
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-3">
                          <span className="w-5 h-5 bg-green-500 text-black text-[10px] font-bold rounded flex items-center justify-center shrink-0">2</span>
                          <span className="text-xs text-green-200">Abra seu Minecraft na versão <strong>1.21.x</strong>.</span>
                        </div>
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-3">
                          <span className="w-5 h-5 bg-green-500 text-black text-[10px] font-bold rounded flex items-center justify-center shrink-0">3</span>
                          <span className="text-xs text-green-200 text-left">Conecte-se ao IP: <code>beta.habbletmine.com</code>.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                      <span>Inscrito em:</span>
                      <span>{new Date(status.created_at).toLocaleDateString()}</span>
                    </div>
                    {status.beta_invites?.campaign && (
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        <span>Campanha:</span>
                        <span className="text-blue-400">{status.beta_invites.campaign}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </StonePanel>

            <StonePanel className="p-6 bg-indigo-500/5 border-indigo-500/20">
              <h3 className="text-lg font-minecraft text-indigo-400 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                VANTAGENS PIONEIRO
              </h3>
              <ul className="space-y-3">
                {[
                  "Tag exclusiva [BETA] no chat global",
                  "Cargo permanente no Discord",
                  "Cosmético único 'Picareta de Cristal'",
                  "Prioridade na compra de VIPs Limitados"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] text-indigo-200/70">
                    <ChevronRight className="w-3 h-3 text-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </StonePanel>
          </div>
        </div>
      </div>
    </div>
  );
}
