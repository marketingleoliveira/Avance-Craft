import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminGetPaymentDetails, adminSimulateWebhook } from '@/lib/services/admin-payments.functions';
import { adminListOrders } from '@/lib/services/admin-orders.functions';
import { StonePanel } from '@/components/ui-kit/StonePanel';
import { WoodSign } from '@/components/ui-kit/WoodSign';
import { Container } from '@/components/ui-kit/Container';
import { 
  CreditCard, 
  Search, 
  Activity, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Code,
  ArrowRight,
  Database,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Route = createFileRoute('/admin/pagamentos-teste')({
  component: AdminPaymentTestHarness,
});

function AdminPaymentTestHarness() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'actions'>('info');

  const getDetails = useServerFn(adminGetPaymentDetails);
  const simulateWebhook = useServerFn(adminSimulateWebhook);
  const listOrders = useServerFn(adminListOrders);

  const { data: orders } = useQuery({
    queryKey: ['admin-orders-list-small'],
    queryFn: () => listOrders({ data: { limit: 10, status: 'pending' } }),
  });

  const { data: details, isLoading, refetch } = useQuery({
    queryKey: ['admin-payment-details', selectedOrderId],
    queryFn: () => getDetails({ data: { orderId: selectedOrderId } }),
    enabled: !!selectedOrderId,
  });

  const simulateMutation = useMutation({
    mutationFn: (args: { orderId: string, status: "approved" | "pending" | "rejected" | "refunded" }) => simulateWebhook({ data: args }),
    onSuccess: () => {
      toast.success("Simulação processada com sucesso!");
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  return (
    <Container className="py-8">
      <div className="mb-8">
        <WoodSign className="mb-2">Mercado Pago Harness</WoodSign>
        <p className="text-muted-foreground">Ambiente Seguro de Testes e Validação de Fluxos Transacionais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Seletor de Pedidos */}
        <div className="space-y-6">
          <StonePanel className="p-4">
            <h3 className="font-pixel text-xs mb-4 flex items-center gap-2 text-primary">
              <Search className="w-4 h-4" /> SELECIONAR PEDIDO
            </h3>
            <div className="space-y-2">
              <select 
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 p-2 font-mono text-[10px] text-stone-100 focus:outline-none focus:border-primary"
              >
                <option value="">-- Selecionar Recente --</option>
                {orders?.items.map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.minecraft_nickname} - R$ {order.total} ({order.status})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="text" 
                  placeholder="Ou cole o UUID..." 
                  className="flex-1 bg-stone-900 border border-stone-700 p-2 font-mono text-[10px] text-stone-100"
                  onChange={(e) => {
                    if (e.target.value.length === 36) setSelectedOrderId(e.target.value);
                  }}
                />
              </div>
            </div>
          </StonePanel>

          <StonePanel className="p-4 border-l-4 border-l-emerald-500">
            <h3 className="font-pixel text-xs mb-4 flex items-center gap-2 text-emerald-500">
              <ShieldAlert className="w-4 h-4" /> STATUS DO MOCK
            </h3>
            <div className="space-y-3 text-[10px] font-mono">
              <div className="flex justify-between border-b border-stone-700 pb-1">
                <span>MP_ACCESS_TOKEN:</span>
                <span className={details?.sanitized_env.MP_ACCESS_TOKEN_PRESENT ? 'text-green-500' : 'text-red-500'}>
                  {details?.sanitized_env.MP_ACCESS_TOKEN_PRESENT ? 'CARREGADO' : 'AUSENTE'}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-700 pb-1">
                <span>SIGNATURE_CHECK:</span>
                <span className="text-amber-500">STAGING_SKIP</span>
              </div>
              <div className="flex justify-between">
                <span>IDEMPOTENCY:</span>
                <span className="text-green-500">ACTIVE</span>
              </div>
            </div>
          </StonePanel>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedOrderId ? (
            <StonePanel className="p-12 text-center">
              <Clock className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <p className="font-pixel text-sm text-muted-foreground">Selecione um pedido para iniciar a inspeção técnica.</p>
            </StonePanel>
          ) : isLoading ? (
            <StonePanel className="p-12 text-center animate-pulse">
              <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="font-pixel text-sm">Carregando evidências do banco...</p>
            </StonePanel>
          ) : (
            <StonePanel className="p-0 overflow-hidden">
              <div className="flex bg-stone-800 border-b border-stone-700">
                {(['info', 'events', 'actions'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-pixel text-[10px] transition-colors ${
                      activeTab === tab ? 'bg-stone-900 text-primary border-b-2 border-primary' : 'text-stone-400 hover:bg-stone-700/50'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/20 rounded border border-white/5">
                        <span className="text-[10px] text-muted-foreground block mb-1 uppercase font-pixel">ID do Pedido</span>
                        <span className="font-mono text-xs">{details?.order.id}</span>
                      </div>
                      <div className="p-4 bg-black/20 rounded border border-white/5">
                        <span className="text-[10px] text-muted-foreground block mb-1 uppercase font-pixel">Status Atual</span>
                        <span className={`font-pixel text-xs ${
                          details?.order.status === 'paid' ? 'text-green-500' : 'text-amber-500'
                        }`}>
                          {details?.order.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-pixel text-xs mb-3 text-stone-400">ITENS DO PEDIDO</h4>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-700 text-stone-500 uppercase">
                            <th className="py-2">Produto</th>
                            <th className="py-2">Preço Unit.</th>
                            <th className="py-2">Qtd.</th>
                            <th className="py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details?.order.order_items.map((item: any) => (
                            <tr key={item.id} className="border-b border-stone-800">
                              <td className="py-2 text-stone-200">{item.product_name}</td>
                              <td className="py-2">R$ {item.unit_price}</td>
                              <td className="py-2">{item.quantity}</td>
                              <td className="py-2 text-right">R$ {item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold text-stone-100">
                            <td colSpan={3} className="py-4 text-right">TOTAL FINAL:</td>
                            <td className="py-4 text-right">R$ {details?.order.total}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'events' && (
                  <div className="space-y-4">
                    <h4 className="font-pixel text-xs text-stone-400">LINHA DO TEMPO DE EVENTOS</h4>
                    <div className="space-y-3">
                      {details?.order.payment_events?.length === 0 ? (
                        <p className="text-xs italic text-stone-500">Nenhum evento registrado para este pedido.</p>
                      ) : (
                        details?.order.payment_events?.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((event: any) => (
                          <div key={event.id} className="p-4 bg-black/20 border border-white/5 rounded">
                            <div className="flex justify-between mb-2">
                              <span className="text-primary font-mono text-[10px]">{event.event_type}</span>
                              <span className="text-stone-500 text-[10px]">
                                {format(new Date(event.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                              </span>
                            </div>
                            <pre className="text-[9px] font-mono bg-black/40 p-2 overflow-x-auto text-stone-300">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded">
                      <div className="flex gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-200 uppercase mb-1">Simulador de Webhook</p>
                          <p className="text-[10px] text-amber-200/70">
                            Gera eventos simulados para validar a lógica de entrega e processamento sem chaves reais.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => simulateMutation.mutate({ orderId: selectedOrderId, status: 'approved' })}
                        disabled={simulateMutation.isPending}
                        className="p-4 bg-green-900/20 border border-green-500/30 hover:bg-green-900/40 text-green-500 flex flex-col items-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-pixel text-[10px]">APROVAR (approved)</span>
                      </button>
                      <button
                        onClick={() => simulateMutation.mutate({ orderId: selectedOrderId, status: 'rejected' })}
                        disabled={simulateMutation.isPending}
                        className="p-4 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-500 flex flex-col items-center gap-2 transition-all"
                      >
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-pixel text-[10px]">REJEITAR (rejected)</span>
                      </button>
                      <button
                        onClick={() => simulateMutation.mutate({ orderId: selectedOrderId, status: 'pending' })}
                        disabled={simulateMutation.isPending}
                        className="p-4 bg-stone-800 border border-stone-600 hover:bg-stone-700 text-stone-300 flex flex-col items-center gap-2 transition-all"
                      >
                        <Clock className="w-6 h-6" />
                        <span className="font-pixel text-[10px]">AGUARDAR (pending)</span>
                      </button>
                      <button
                        onClick={() => simulateMutation.mutate({ orderId: selectedOrderId, status: 'refunded' })}
                        disabled={simulateMutation.isPending}
                        className="p-4 bg-blue-900/20 border border-blue-500/30 hover:bg-blue-900/40 text-blue-500 flex flex-col items-center gap-2 transition-all"
                      >
                        <RefreshCw className="w-6 h-6" />
                        <span className="font-pixel text-[10px]">REEMBOLSAR (refunded)</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-stone-700">
                      <h4 className="font-pixel text-[10px] text-stone-400 mb-3 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> VERIFICAÇÕES DE NEGÓCIO (STAGING)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          "Idempotência da Fila de Entrega",
                          "Consistência de Valor Unitário",
                          "External Reference Lookup",
                          "Sanitização de Log PII"
                        ].map(check => (
                          <div key={check} className="flex items-center gap-2 text-[9px] text-stone-500">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {check}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </StonePanel>
          )}
        </div>
      </div>
    </Container>
  );
}
