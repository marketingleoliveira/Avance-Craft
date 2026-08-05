import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { adminListTickets } from "@/lib/services/admin-support.functions";
import { StonePanel } from "@/components/ui-kit/StonePanel";
import { PixelButton } from "@/components/ui-kit/PixelButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { Ticket, Search, Filter, Clock, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/tickets")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["admin-tickets", {}],
      queryFn: () => adminListTickets({}),
    });
  },
  component: AdminTicketsPage,
});

function AdminTicketsPage() {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["admin-tickets", filters],
    queryFn: () => adminListTickets(filters),
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      pending: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      closed: "bg-zinc-500/20 text-zinc-600 border-zinc-500/30",
    };

    const labels: Record<string, string> = {
      open: "Novo",
      pending: "Pendente",
      closed: "Resolvido",
    };

    return (
      <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold border", styles[status] || styles["open"])}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-pixel uppercase flex items-center gap-3 text-zinc-800">
            <Ticket className="w-6 h-6 text-emerald-600" />
            Fila de Atendimento
          </h2>
          <p className="text-zinc-500 text-sm">Gerencie os pedidos de suporte dos jogadores.</p>
        </div>
      </div>

      <StonePanel className="p-4" bodyClassName="p-0">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Assunto ou Nick..."
                className="pl-9 pr-4 py-2 bg-white border border-zinc-300 rounded text-sm focus:border-emerald-500 outline-none w-64"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">Status</label>
            <select
              className="px-4 py-2 bg-white border border-zinc-300 rounded text-sm focus:border-emerald-500 outline-none"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="open">Novo (Aberto)</option>
              <option value="pending">Pendente (Staff Respondeu)</option>
              <option value="closed">Resolvido / Fechado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">Categoria</label>
            <select
              className="px-4 py-2 bg-white border border-zinc-300 rounded text-sm focus:border-emerald-500 outline-none"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Todas</option>
              <option value="Compra">Compra</option>
              <option value="Entrega">Entrega</option>
              <option value="Conta">Conta</option>
              <option value="Servidor">Servidor</option>
              <option value="Bug">Bug</option>
              <option value="Denúncia">Denúncia</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <PixelButton variant="stone" onClick={() => setFilters({ search: "", status: "", category: "" })} className="h-[38px] px-3">
            Limpar
          </PixelButton>
        </div>

        <AdminTable
          data={data.tickets}
          columns={[
            {
              header: "Ticket",
              accessor: (row) => (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400">#{row.id.slice(0, 8)}</span>
                    {getStatusBadge(row.status)}
                  </div>
                  <div className="font-bold text-zinc-800">{row.subject}</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">{row.category}</div>
                </div>
              ),
            },
            {
              header: "Jogador",
              accessor: (row) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-sm font-bold text-zinc-700">{row.profile?.minecraft_nickname || "N/A"}</div>
                </div>
              ),
            },
            {
              header: "Última Atividade",
              accessor: (row) => (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase">
                    <Clock className="w-3 h-3" />
                    {format(new Date(row.updated_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 uppercase">
                    <MessageSquare className="w-3 h-3" />
                    {row.id ? "Ver histórico" : ""}
                  </div>
                </div>
              ),
            },
            {
              header: "Ações",
              accessor: (row) => (
                <div className="flex items-center gap-2">
                  <Link to="/admin/tickets" search={{ id: row.id }}>
                    <PixelButton variant="emerald" className="p-2 h-auto">
                      Atender
                    </PixelButton>
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </StonePanel>
    </div>
  );
}
