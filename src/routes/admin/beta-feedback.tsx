import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WoodSign } from '@/components/ui-kit/WoodSign'
import { StonePanel } from '@/components/ui-kit/StonePanel'
import { PixelButton } from '@/components/ui-kit/PixelButton'
import { getAdminFeedbacks, updateFeedbackStatus, FeedbackType, FeedbackStatus, FeedbackSeverity } from '@/lib/services/feedback.functions'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert,
  User,
  Tag,
  Download,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/beta-feedback')({
  component: AdminFeedbackPage,
})

function AdminFeedbackPage() {
  const [filters, setFilters] = useState<{
    status?: string;
    type?: string;
    severity?: string;
  }>({})

  const queryClient = useQueryClient()
  const getFeedbacksFn = useServerFn(getAdminFeedbacks)
  const updateStatusFn = useServerFn(updateFeedbackStatus)

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['admin-feedbacks', filters],
    queryFn: () => getFeedbacksFn({ data: filters }),
  })

  const mutation = useMutation({
    mutationFn: updateStatusFn,
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message)
    }
  })

  const handleExportCSV = () => {
    if (!feedbacks) return
    const headers = ['ID', 'Data', 'Usuário', 'Tipo', 'Severidade', 'Status', 'Título']
    const rows = feedbacks.map((f: any) => [
      f.id,
      new Date(f.created_at).toLocaleString(),
      f.profiles?.username || 'Anônimo',
      f.type,
      f.severity,
      f.status,
      f.title
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "feedbacks_beta.csv")
    link.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'resolved': return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      default: return 'text-blue-400'
    }
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-minecraft text-white flex items-center gap-3">
            <ShieldAlert className="text-primary" /> Beta Feedback Center
          </h1>
          <p className="text-gray-400">Gerencie reportes de bugs e sugestões dos participantes do Beta.</p>
        </div>

        <PixelButton onClick={handleExportCSV} className="flex items-center gap-2">
          <Download size={18} /> Exportar CSV
        </PixelButton>
      </div>

      {/* Filtros */}
      <StonePanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-minecraft text-gray-500 flex items-center gap-2">
              <Filter size={12} /> Status
            </label>
            <select 
              value={filters.status || ''}
              onChange={(e) => setFilters({...filters, status: e.target.value || undefined})}
              className="w-full bg-black/40 border border-white/10 p-2 text-white font-minecraft outline-none"
            >
              <option value="">Todos</option>
              <option value="new">Novo</option>
              <option value="triaged">Triado</option>
              <option value="in_progress">Em Progresso</option>
              <option value="resolved">Resolvido</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-minecraft text-gray-500 flex items-center gap-2">
              <Tag size={12} /> Tipo
            </label>
            <select 
              value={filters.type || ''}
              onChange={(e) => setFilters({...filters, type: e.target.value || undefined})}
              className="w-full bg-black/40 border border-white/10 p-2 text-white font-minecraft outline-none"
            >
              <option value="">Todos</option>
              <option value="bug">Bug</option>
              <option value="suggestion">Sugestão</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-minecraft text-gray-500 flex items-center gap-2">
              <AlertTriangle size={12} /> Severidade
            </label>
            <select 
              value={filters.severity || ''}
              onChange={(e) => setFilters({...filters, severity: e.target.value || undefined})}
              className="w-full bg-black/40 border border-white/10 p-2 text-white font-minecraft outline-none"
            >
              <option value="">Todas</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>

          <div className="flex items-end">
            <PixelButton 
              onClick={() => setFilters({})} 
              className="w-full py-2.5 opacity-60 hover:opacity-100"
            >
              Limpar Filtros
            </PixelButton>
          </div>
        </div>
      </StonePanel>

      {/* Lista de Feedbacks */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-gray-500 font-minecraft">
            Escaneando base de dados...
          </div>
        ) : feedbacks?.length === 0 ? (
          <StonePanel className="p-20 text-center text-gray-500 font-minecraft">
            Nenhum reporte encontrado para estes filtros.
          </StonePanel>
        ) : (
          <div className="grid gap-4">
            {feedbacks?.map((f: any) => (
              <StonePanel key={f.id} className="p-6 border-l-4 border-l-primary/30">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-minecraft uppercase border rounded",
                        getStatusColor(f.status)
                      )}>
                        {f.status}
                      </span>
                      <span className={cn(
                        "text-[10px] font-minecraft uppercase flex items-center gap-1",
                        getSeverityColor(f.severity)
                      )}>
                        <AlertTriangle size={12} /> {f.severity}
                      </span>
                      <span className="text-[10px] font-minecraft text-gray-500 uppercase flex items-center gap-1">
                        <Tag size={12} /> {f.type}
                      </span>
                      <span className="text-xs text-gray-500 font-minecraft ml-auto flex items-center gap-1">
                        <Clock size={12} /> {new Date(f.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-minecraft text-white">{f.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{f.description}</p>

                    <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <span className="text-xs text-gray-300 font-minecraft">
                          {f.profiles?.username || 'Anônimo'}
                        </span>
                      </div>
                      {f.minecraft_nickname && (
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-green-500" />
                          <span className="text-xs text-gray-300 font-minecraft">
                            {f.minecraft_nickname}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[180px]">
                    <p className="text-[10px] font-minecraft text-gray-500 uppercase mb-1">Ações Rápidas</p>
                    <div className="grid grid-cols-2 gap-2">
                      <PixelButton 
                        onClick={() => mutation.mutate({ data: { id: f.id, status: 'resolved' } })}
                        className="text-[10px] py-2 bg-green-900/40 hover:bg-green-800/60"
                        disabled={f.status === 'resolved'}
                      >
                        Resolver
                      </PixelButton>
                      <PixelButton 
                        onClick={() => mutation.mutate({ data: { id: f.id, status: 'in_progress' } })}
                        className="text-[10px] py-2 bg-yellow-900/40 hover:bg-yellow-800/60"
                        disabled={f.status === 'in_progress'}
                      >
                        Focar
                      </PixelButton>
                    </div>
                    <PixelButton className="text-xs py-2 bg-stone-800/40">
                      Abrir Detalhes
                    </PixelButton>
                  </div>
                </div>
              </StonePanel>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
