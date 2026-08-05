import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listMyTickets, createTicket } from "@/lib/services/support.functions";
import { listMyOrders } from "@/lib/services/orders.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { WoodSign } from "@/components/ui-kit/WoodSign";
import { PixelButton } from "@/components/ui-kit/PixelButton";
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
      data: {
        category: data.category,
        subject: data.subject,
        message: data.message,
        orderId: data.orderId || undefined,
      }
    }),
    onSuccess: () => {
      toast.success("Chamado aberto com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      setIsCreating(false);
      reset();
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
      open: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      pending: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      closed: "bg-zinc-500/20 text-zinc-600 border-zinc-500/30",
    };

    const labels: Record<string, string> = {
      open: "Aberto",
      pending: "Em Análise",
      closed: "Fechado",
    };

    return (
      <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold border", styles[status] || styles["open"])}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="container max-w-[1180px] mx-auto py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <WoodSign subtitle="Precisa de ajuda? Abra um chamado e nossa equipe responderá em breve.">
          Suporte
        </WoodSign>

        {!isCreating && (
          <PixelButton onClick={() => setIsCreating(true)} variant="emerald" className="h-fit">
            <Plus className="w-5 h-5 mr-2" />
            Novo Chamado
          </PixelButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {isCreating ? (
            <StonePanel title="Abrir Novo Chamado">
              <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-600">Categoria</label>
                    <select
                      {...register("category")}
                      className="w-full bg-white border-2 border-zinc-300 rounded px-4 py-2.5 text-zinc-900 focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="" disabled>Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-600">Pedido Vinculado (Opcional)</label>
                    <select
                      {...register("orderId")}
                      className="w-full bg-white border-2 border-zinc-300 rounded px-4 py-2.5 text-zinc-900 focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Nenhum pedido</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          #{order.id.slice(0, 8)} - {format(new Date(order.created_at), "dd/MM/yy")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-600">Assunto</label>
                  <input
                    {...register("subject")}
                    placeholder="Ex: Não recebi meu VIP após a compra"
                    className="w-full bg-white border-2 border-zinc-300 rounded px-4 py-2.5 text-zinc-900 focus:border-emerald-500 outline-none transition-colors"
                  />
                  {errors.subject && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-600">Descrição do Problema</label>
                  <textarea
                    {...register("message")}
                    rows={6}
                    placeholder="Descreva detalhadamente o que aconteceu..."
                    className="w-full bg-white border-2 border-zinc-300 rounded px-4 py-2.5 text-zinc-900 focus:border-emerald-500 outline-none transition-colors resize-none"
                  />
                  {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.message.message}</p>}
                </div>

                <div className="flex gap-4 pt-4 border-t border-zinc-200">
                  <PixelButton
                    type="submit"
                    variant="emerald"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Chamado"}
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant="stone"
                    onClick={() => {
                      setIsCreating(false);
                      reset();
                    }}
                  >
                    Cancelar
                  </PixelButton>
                </div>
              </form>
            </StonePanel>
          ) : (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <StonePanel className="p-12 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                    <MessageSquare className="w-16 h-16 text-zinc-400 mx-auto" />
                    <h3 className="text-xl font-pixel uppercase text-zinc-600">Nenhum chamado aberto</h3>
                    <p className="text-zinc-500 text-sm">
                      Você ainda não abriu nenhum ticket de suporte. Clique em "Novo Chamado" para começar.
                    </p>
                  </div>
                </StonePanel>
              ) : (
                tickets.map((ticket) => (
                  <StonePanel key={ticket.id} className="group transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-zinc-400">#{ticket.id.slice(0, 8)}</span>
                          {getStatusBadge(ticket.status)}
                          <span className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{ticket.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-800">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-zinc-400">
                          <span className="flex items-center gap-1">
                            <History className="w-3 h-3" />
                            Atualizado em {format(new Date(ticket.updated_at), "dd/MM, HH:mm", { locale: ptBR })}
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
                      >
                        <PixelButton variant="stone" className="w-full md:w-auto">
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

        <div className="lg:col-span-4 space-y-6">
          <StonePanel title="Canais Oficiais">
            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-indigo-50 border-2 border-indigo-100 rounded group hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 bg-indigo-500 rounded flex items-center justify-center shrink-0">
                  <MessageSquare className="text-white w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-600 text-sm uppercase font-pixel">Discord</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Atendimento comunitário e denúncias.</p>
                  <a href="#" className="text-[11px] text-indigo-500 font-bold hover:underline mt-1 inline-block uppercase font-pixel">discord.gg/habblet</a>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-emerald-50 border-2 border-emerald-100 rounded group hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center shrink-0">
                  <User className="text-white w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-600 text-sm uppercase font-pixel">Área do VIP</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Prioridade máxima no atendimento.</p>
                </div>
              </div>
            </div>
          </StonePanel>

          <div className="bg-parchment/50 border-2 border-zinc-300 rounded p-6">
            <h4 className="font-bold text-zinc-600 mb-4 flex items-center gap-2 text-xs uppercase font-pixel">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Segurança
            </h4>
            <ul className="text-[10px] font-bold uppercase text-zinc-500 space-y-3">
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                Nunca compartilhe sua senha do servidor.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                A staff nunca pedirá seus itens.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                Anexe links de imagens para bugs.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500">•</span>
                Respeite o tempo de resposta.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
