import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listMyTickets, createTicket } from "@/lib/services/support.functions";
import { listMyOrders } from "@/lib/services/orders.functions";
import { StonePanel } from "@/components/ui/StonePanel";
import { WoodSign } from "@/components/ui/WoodSign";
import { PixelButton } from "@/components/ui/PixelButton";
import { Ticket, Plus, MessageSquare, History, ShoppingBag, AlertTriangle, Bug, HelpCircle, User, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const ticketSchema = z.object({
  category: z.string().min(1, "Escolha uma categoria"),
  subject: z.string().trim().min(4, "Assunto muito curto").max(120),
  message: z.string().trim().min(10, "Mensagem muito curta").max(4000),
  orderId: z.string().uuid().optional().or(z.literal("")),
});

type TicketForm = z.infer<typeof ticketSchema>;

const title = "Suporte — Habblet Mine";
const description = "Central de suporte e chamados do servidor Habblet Mine.";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["my-tickets"],
        queryFn: () => listMyTickets(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["my-orders"],
        queryFn: () => listMyOrders(),
      }),
    ]);
  },
  component: SupportPage,
});

function SupportPage() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: tickets } = useSuspenseQuery({
    queryKey: ["my-tickets"],
    queryFn: () => listMyTickets(),
  });

  const { data: orders } = useSuspenseQuery({
    queryKey: ["my-orders"],
    queryFn: () => listMyOrders(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: "",
      subject: "",
      message: "",
      orderId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TicketForm) => createTicket({
      ...data,
      orderId: data.orderId || undefined,
    }),
    onSuccess: (newTicket) => {
      toast.success("Chamado aberto com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      setIsCreating(false);
      reset();
      // Optionally navigate to the ticket detail page if it existed
      // navigate({ to: `/suporte/${newTicket.id}` });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao abrir chamado.");
    },
  });

  const categories = [
    { value: "Compra", label: "Compra", icon: ShoppingBag },
    { value: "Entrega", label: "Entrega", icon: History },
    { value: "Conta", label: "Conta", icon: User },
    { value: "Servidor", label: "Servidor", icon: AlertTriangle },
    { value: "Denúncia", label: "Denúncia", icon: ShieldAlert },
    { value: "Bug", label: "Bug", icon: Bug },
    { value: "Outro", label: "Outro", icon: HelpCircle },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      closed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    };

    const labels: Record<string, string> = {
      open: "Aberto",
      pending: "Em Análise",
      closed: "Fechado",
    };

    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border capitalize", styles[status] || styles.open)}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="container max-w-[1180px] mx-auto py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <WoodSign className="max-w-md">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ticket className="w-8 h-8 text-amber-400" />
            Suporte ao Jogador
          </h1>
          <p className="text-amber-100/80 mt-1">
            Precisa de ajuda? Abra um chamado e nossa equipe responderá em breve.
          </p>
        </WoodSign>

        {!isCreating && (
          <PixelButton onClick={() => setIsCreating(true)} variant="primary" className="h-fit">
            <Plus className="w-5 h-5 mr-2" />
            Novo Chamado
          </PixelButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Formulário ou Lista */}
        <div className="lg:col-span-8 space-y-6">
          {isCreating ? (
            <StonePanel title="Abrir Novo Chamado">
              <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Categoria</label>
                    <select
                      {...register("category")}
                      className="w-full bg-black/40 border-2 border-zinc-800 rounded px-4 py-2.5 text-zinc-100 focus:border-amber-500 outline-none transition-colors"
                    >
                      <option value="" disabled>Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-zinc-900">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Pedido Vinculado (Opcional)</label>
                    <select
                      {...register("orderId")}
                      className="w-full bg-black/40 border-2 border-zinc-800 rounded px-4 py-2.5 text-zinc-100 focus:border-amber-500 outline-none transition-colors"
                    >
                      <option value="">Nenhum pedido</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id} className="bg-zinc-900">
                          #{order.id.slice(0, 8)} - {format(new Date(order.created_at), "dd/MM/yy")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Assunto</label>
                  <input
                    {...register("subject")}
                    placeholder="Ex: Não recebi meu VIP após a compra"
                    className="w-full bg-black/40 border-2 border-zinc-800 rounded px-4 py-2.5 text-zinc-100 focus:border-amber-500 outline-none transition-colors"
                  />
                  {errors.subject && <p className="text-red-400 text-xs">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Descrição do Problema</label>
                  <textarea
                    {...register("message")}
                    rows={6}
                    placeholder="Descreva detalhadamente o que aconteceu..."
                    className="w-full bg-black/40 border-2 border-zinc-800 rounded px-4 py-2.5 text-zinc-100 focus:border-amber-500 outline-none transition-colors resize-none"
                  />
                  {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
                </div>

                <div className="flex gap-4 pt-4 border-t border-zinc-800">
                  <PixelButton
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Chamado"}
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsCreating(false);
                      reset();
                    }}
                  >
                    Cancelar
                  </PixelButton>
                </div>
              </form> stonePanel
            </StonePanel>
          ) : (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <StonePanel className="p-12 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                    <MessageSquare className="w-16 h-16 text-zinc-600 mx-auto" />
                    <h3 className="text-xl font-bold text-zinc-300">Nenhum chamado aberto</h3>
                    <p className="text-zinc-500 text-sm">
                      Você ainda não abriu nenhum ticket de suporte. Clique em "Novo Chamado" para começar.
                    </p>
                  </div>
                </StonePanel>
              ) : (
                tickets.map((ticket) => (
                  <StonePanel key={ticket.id} className="group hover:border-amber-500/50 transition-colors">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-zinc-500">#{ticket.id.slice(0, 8)}</span>
                          {getStatusBadge(ticket.status)}
                          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">{ticket.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-100">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <History className="w-3 h-3" />
                            Atualizado em {format(new Date(ticket.updated_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.messages?.length || 0} mensagens
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/suporte"
                        search={{ ticket: ticket.id }}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      >
                        <PixelButton variant="secondary" className="w-full md:w-auto">
                          Ver Detalhes
                        </PixelButton>
                      </Link>
                    </div>
                  </StonePanel>
                ))
              )}
            </div>
          )}
        </div>

        {/* Lado Direito: Info & Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <StonePanel title="Canais Oficiais">
            <div className="p-6 space-y-6">
              <div className="flex gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg group hover:bg-indigo-500/20 transition-colors">
                <div className="w-12 h-12 bg-indigo-500 rounded flex items-center justify-center shrink-0">
                  <MessageSquare className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-400">Discord</h4>
                  <p className="text-xs text-zinc-400">Atendimento comunitário e denúncias rápidas.</p>
                  <a href="#" className="text-xs text-indigo-400 font-bold hover:underline mt-1 inline-block">discord.gg/habbletmine</a>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg group hover:bg-emerald-500/20 transition-colors">
                <div className="w-12 h-12 bg-emerald-500 rounded flex items-center justify-center shrink-0">
                  <User className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400">Área do VIP</h4>
                  <p className="text-xs text-zinc-400">Jogadores VIP possuem prioridade no atendimento.</p>
                </div>
              </div>
            </div>
          </StonePanel>

          <div className="bg-black/40 border-2 border-zinc-800 rounded p-6">
            <h4 className="font-bold text-zinc-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Dicas de Segurança
            </h4>
            <ul className="text-xs text-zinc-500 space-y-3">
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                Nunca compartilhe sua senha do servidor ou do portal.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                A staff do Habblet Mine nunca pedirá seus itens ou senha.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                Para bugs críticos, anexe screenshots ou vídeos (via link).
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                Respeite o tempo de resposta; o flood de tickets pode resultar em banimento do suporte.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
