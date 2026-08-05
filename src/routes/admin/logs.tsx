import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getErrorLogs, pruneLogs } from '@/lib/services/admin-logs.functions';
import { StonePanel } from '@/components/ui-kit/StonePanel';
import { PixelButton } from '@/components/ui-kit/PixelButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Info, ShieldAlert, Database, Search, Filter, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/logs')({
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const [severity, setSeverity] = useState<string>('all');
  const [service, setService] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-logs', severity, service, search, page],
    queryFn: () => getErrorLogs({
      data: {
        severity: severity === 'all' ? undefined : severity,
        service: service === 'all' ? undefined : service,
        search: search || undefined,
        page,
        pageSize: 50
      }
    })
  });

  const handlePrune = async () => {
    if (!confirm('Tem certeza que deseja apagar logs com mais de 30 dias?')) return;
    
    try {
      await pruneLogs({ data: { days: 30 } });
      toast.success('Logs antigos removidos com sucesso');
      refetch();
    } catch (err: any) {
      toast.error('Erro ao limpar logs: ' + err.message);
    }
  };

  const exportLogs = () => {
    if (!data?.logs) return;
    const csv = [
      ['Data', 'Severidade', 'Serviço', 'Módulo', 'Mensagem', 'User ID', 'Order ID'].join(','),
      ...data.logs.map(log => [
        log.created_at,
        log.severity,
        log.service,
        log.module || '',
        `"${log.message.replace(/"/g, '""')}"`,
        log.user_id || '',
        log.order_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-avance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Observabilidade Enterprise
          </h1>
          <p className="text-gray-400">Monitoramento centralizado de erros e auditoria do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <PixelButton variant="stone" onClick={exportLogs} className="bg-slate-700 border-slate-800">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </PixelButton>
          <PixelButton variant="stone" onClick={handlePrune} className="bg-red-700 border-red-900">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Antigos
          </PixelButton>
        </div>
      </div>

      <StonePanel className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Pesquisar mensagens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-black/40 border-stone-700 text-white"
            />
          </div>
          
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="bg-black/40 border-stone-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Severidades</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="warn">Aviso</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="audit">Auditoria</SelectItem>
            </SelectContent>
          </Select>

          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="bg-black/40 border-stone-700 text-white">
              <Database className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Serviços</SelectItem>
              <SelectItem value="checkout">Checkout</SelectItem>
              <SelectItem value="mercadopago">Mercado Pago</SelectItem>
              <SelectItem value="plugin">Plugin Minecraft</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="support">Suporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </StonePanel>

      <StonePanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Severidade</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Mensagem</th>
                <th className="px-6 py-4">Contexto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-gray-500">Carregando logs...</p>
                  </td>
                </tr>
              ) : data?.logs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    Nenhum log encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                data?.logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {format(new Date(log.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={log.severity} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-stone-800 px-2 py-1 rounded text-stone-300">
                        {log.service}
                        {log.module && <span className="text-stone-500">:{log.module}</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-200 line-clamp-2 max-w-md" title={log.message}>
                        {log.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {Object.keys(log.context || {}).length > 0 && (
                        <button 
                          onClick={() => console.log('Context:', log.context)}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver JSON
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </StonePanel>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  switch (severity) {
    case 'critical':
      return <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase"><AlertCircle className="w-3 h-3" /> Crítico</span>;
    case 'error':
      return <span className="flex items-center gap-1 text-orange-500 text-xs font-bold uppercase"><AlertCircle className="w-3 h-3" /> Erro</span>;
    case 'warn':
      return <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold uppercase"><AlertCircle className="w-3 h-3" /> Aviso</span>;
    case 'audit':
      return <span className="flex items-center gap-1 text-blue-400 text-xs font-bold uppercase"><ShieldAlert className="w-3 h-3" /> Auditoria</span>;
    default:
      return <span className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase"><Info className="w-3 h-3" /> Info</span>;
  }
}
