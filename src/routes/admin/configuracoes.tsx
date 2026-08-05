import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminListFeatureFlags, adminUpdateFeatureFlag } from '@/lib/services/admin-flags.functions';
import { runStagingSeed, clearStagingData } from '@/lib/services/staging.functions';
import { StonePanel } from '@/components/ui-kit/StonePanel';
import { WoodSign } from '@/components/ui-kit/WoodSign';
import { Container } from '@/components/ui-kit/Container';
import { 
  Settings, 
  ShieldCheck, 
  ShoppingCart, 
  Truck, 
  UserPlus, 
  Layout, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Globe,
  RefreshCw,
  MessageSquare,
  Activity,
  Database,
  Trash2,
  TestTube,
  Ticket,
  Terminal,
  Save,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { FeatureFlag } from '@/lib/config/flags';
import { useServerFn } from '@tanstack/react-start';
import { isStaging, isDev } from '@/lib/config/env.server';
import { getHomeData } from '@/lib/services/content.functions';
import { adminUpdateSiteSettings } from '@/lib/services/admin-settings.functions';
import { PixelButton } from '@/components/ui-kit/PixelButton';


export const Route = createFileRoute('/admin/configuracoes')({
  component: AdminFlagsPage,
});

const FLAG_METADATA: Record<string, { label: string; description: string; icon: any; critical?: boolean }> = {
  STORE_ENABLED: { 
    label: "Loja Ativa", 
    description: "Habilita ou desabilita todo o sistema de compras do portal.",
    icon: ShoppingCart,
    critical: true
  },
  REAL_PAYMENTS_ENABLED: { 
    label: "Pagamentos Reais", 
    description: "Se desativado, o sistema opera em Modo Mock (simulação).",
    icon: ShieldCheck,
    critical: true
  },
  PLUGIN_DELIVERY_ENABLED: { 
    label: "Entrega Automática", 
    description: "Habilita a comunicação com o plugin para entrega de itens no jogo.",
    icon: Truck,
    critical: true
  },
  REGISTRATION_ENABLED: { 
    label: "Novos Cadastros", 
    description: "Habilita ou bloqueia o registro de novos usuários no portal.",
    icon: UserPlus 
  },
  MAINTENANCE_MODE: { 
    label: "Modo Manutenção", 
    description: "Bloqueia o acesso público ao portal com uma tela informativa.",
    icon: Lock,
    critical: true
  },
  DEMO_RANKINGS_ENABLED: { 
    label: "Rankings Demo", 
    description: "Exibe dados fictícios no ranking para preencher a interface.",
    icon: Layout 
  },
  SUPPORT_ENABLED: { 
    label: "Tickets de Suporte", 
    description: "Habilita o sistema de abertura de tickets pelos jogadores.",
    icon: MessageSquare 
  },
  GOOGLE_LOGIN_ENABLED: { 
    label: "Login via Google", 
    description: "Habilita a autenticação social através do Google.",
    icon: Globe 
  },
  DISCORD_LOGIN_ENABLED: { 
    label: "Login via Discord", 
    description: "Habilita a autenticação social através do Discord.",
    icon: MessageSquare 
  }
};

function AdminFlagsPage() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const listFlags = useServerFn(adminListFeatureFlags);
  const updateFlag = useServerFn(adminUpdateFeatureFlag);
  const fetchSettings = useServerFn(getHomeData);
  const saveSettings = useServerFn(adminUpdateSiteSettings);

  const { data: homeData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: () => fetchSettings(),
  });

  useEffect(() => {
    if (homeData?.settings) {
      setSiteSettings(homeData.settings);
    }
  }, [homeData]);

  const { data: flags, isLoading: isLoadingFlags } = useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: () => listFlags(),
  });

  const updateMutation = useMutation({
    mutationFn: (args: { flag: string, value: boolean, reason: string }) => updateFlag({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success("Configuração atualizada com sucesso!");
      setReason("");
      setSelectedFlag(null);
    },
    onError: (err: any) => {
      toast.error(`Falha ao atualizar: ${err.message}`);
    }
  });

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await saveSettings({ data: { settings: siteSettings } });
      toast.success("Configurações institucionais salvas!");
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoadingFlags || isLoadingSettings) return <Container className="py-12"><div className="text-center text-foreground font-pixel text-sm">Carregando configurações...</div></Container>;


  const handleToggle = (flag: string, currentValue: boolean) => {
    if (selectedFlag === flag) {
      setSelectedFlag(null);
      return;
    }
    setSelectedFlag(flag);
  };

  const confirmChange = () => {
    if (!selectedFlag || !reason) return;
    
    updateMutation.mutate({
      flag: selectedFlag,
      value: !flags?.[selectedFlag as FeatureFlag],
      reason
    });
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <WoodSign className="mb-2">Feature Flags</WoodSign>
          <p className="text-muted-foreground">Controle granular das funcionalidades do Avance.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/saude" className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 font-pixel text-[10px] border-b-4 border-stone-900 transition-all">
            <Activity className="w-4 h-4" /> SAÚDE DO SISTEMA
          </Link>
          <Link to="/admin/auditoria" className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 font-pixel text-[10px] border-b-4 border-stone-900 transition-all">
            <History className="w-4 h-4" /> AUDITORIA
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Configurações Institucionais */}
          <StonePanel className="p-6">
            <h2 className="font-pixel text-sm mb-6 flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" /> DADOS INSTITUCIONAIS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">Razão Social / Nome:</label>
                <input 
                  type="text"
                  value={siteSettings['business_legal_name'] || ""}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, business_legal_name: e.target.value }))}
                  placeholder="Avance Ltda"
                  className="w-full bg-stone-900 border border-stone-700 p-2 font-sans text-sm text-stone-100 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">CNPJ:</label>
                <input 
                  type="text"
                  value={siteSettings['business_cnpj'] || ""}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, business_cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-stone-900 border border-stone-700 p-2 font-sans text-sm text-stone-100 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">E-mail de Contato:</label>
                <input 
                  type="email"
                  value={siteSettings['business_email'] || ""}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, business_email: e.target.value }))}
                  placeholder="contato@habbletmine.com.br"
                  className="w-full bg-stone-900 border border-stone-700 p-2 font-sans text-sm text-stone-100 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-pixel text-muted-foreground uppercase">Endereço Comercial:</label>
                <input 
                  type="text"
                  value={siteSettings['business_address'] || ""}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, business_address: e.target.value }))}
                  placeholder="Av. Paulista, 1000 - São Paulo/SP"
                  className="w-full bg-stone-900 border border-stone-700 p-2 font-sans text-sm text-stone-100 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-700 flex justify-end">
              <PixelButton 
                variant="emerald" 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </PixelButton>
            </div>
          </StonePanel>

          <div className="space-y-4">
            <h2 className="font-pixel text-sm mb-4 flex items-center gap-2 text-primary px-2">
              <Settings className="w-5 h-5" /> FUNCIONALIDADES (FLAGS)
            </h2>

          {Object.entries(FLAG_METADATA).map(([id, meta]) => {
            const isActive = flags?.[id as FeatureFlag];
            const isEditing = selectedFlag === id;
            const Icon = meta.icon;

            return (
              <StonePanel key={id} className={`p-4 transition-all ${isEditing ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-none ${isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-pixel text-sm flex items-center gap-2">
                        {meta.label}
                        {meta.critical && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md">{meta.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggle(id, !!isActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-emerald-600' : 'bg-stone-600'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-[10px] font-pixel ${isActive ? 'text-emerald-500' : 'text-stone-400'}`}>
                      {isActive ? 'ATIVADO' : 'DESATIVADO'}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-stone-700 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-bold">Ação Crítica</p>
                        <p>Alterar esta flag afeta imediatamente todos os jogadores. Justifique a mudança para o log de auditoria.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-pixel text-muted-foreground uppercase">Motivo da Alteração:</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Manutenção emergencial do banco de dados..."
                        className="w-full bg-stone-900 border border-stone-700 p-3 font-sans text-sm text-stone-100 focus:outline-none focus:border-primary min-h-[80px]"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setSelectedFlag(null)}
                        className="px-4 py-2 font-pixel text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        CANCELAR
                      </button>
                      <button 
                        onClick={confirmChange}
                        disabled={!reason || updateMutation.isPending}
                        className="px-6 py-2 bg-primary text-primary-foreground font-pixel text-[10px] border-b-4 border-primary-dark hover:translate-y-1 hover:border-b-0 transition-all disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'SALVANDO...' : 'CONFIRMAR ALTERAÇÃO'}
                      </button>
                    </div>
                  </div>
                )}
              </StonePanel>
            );
          })}
          </div>
        </div>


        <div className="space-y-6">
          {(isStaging() || isDev()) && (
            <StonePanel className="p-6 border-l-4 border-l-amber-500 bg-amber-500/5">
              <h2 className="font-pixel text-sm mb-4 flex items-center gap-2 text-amber-500">
                <Database className="w-4 h-4" /> FERRAMENTAS DE STAGING
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Ambiente de testes detectado. Use as ferramentas abaixo para gerenciar dados simulados.
              </p>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    const fn = runStagingSeed;
                    toast.promise(fn(), {
                      loading: 'Executando seed...',
                      success: 'Ambiente de staging populado!',
                      error: (err) => `Erro: ${err.message}`
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-pixel text-[10px] border-b-2 border-stone-900 transition-all"
                >
                  <Database className="w-3 h-3" /> POPULAR STAGING (SEED)
                </button>
                
                <button
                  onClick={async () => {
                    if (!confirm("ATENÇÃO: Isso apagará TODOS os pedidos, pagamentos e tickets deste ambiente. Continuar?")) return;
                    const fn = clearStagingData;
                    toast.promise(fn({ data: { confirm: true } }), {
                      loading: 'Limpando dados...',
                      success: 'Dados transacionais limpos!',
                      error: (err) => `Erro: ${err.message}`
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 font-pixel text-[10px] border-b-2 border-red-900/60 transition-all"
                >
                  <Trash2 className="w-3 h-3" /> LIMPAR TRANSAÇÕES
                </button>
                <Link
                  to="/admin/pagamentos-teste"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-pixel text-[10px] border-b-2 border-blue-800 transition-all mt-3"
                >
                  <TestTube className="w-3 h-3" /> TEST HARNESS (PAGAMENTOS)
                </Link>
                <Link
                  to="/admin/plugin-teste"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-[10px] border-b-2 border-indigo-800 transition-all"
                >
                  <Terminal className="w-3 h-3" /> INTEGRAÇÃO MINECRAFT
                </Link>
                <Link
                  to="/admin/beta-convites"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-pixel text-[10px] border-b-2 border-orange-800 transition-all"
                >
                  <Ticket className="w-3 h-3" /> GERIR CONVITES BETA
                </Link>
                <Link
                  to="/admin/beta-feedback"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-pixel text-[10px] border-b-2 border-green-800 transition-all"
                >
                  <ShieldCheck className="w-3 h-3" /> GESTÃO DE FEEDBACK
                </Link>
              </div>
            </StonePanel>
          )}

          <StonePanel className="p-6">
            <h2 className="font-pixel text-sm mb-4 flex items-center gap-2 text-primary">
              <RefreshCw className="w-4 h-4" /> RESUMO DO AMBIENTE
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-700 pb-2">
                <span className="text-muted-foreground">Ambiente:</span>
                <span className="font-pixel text-[10px] text-amber-500 uppercase">{process.env['NODE_ENV'] || 'development'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-700 pb-2">
                <span className="text-muted-foreground">Modo Pagamento:</span>
                <span className={`font-pixel text-[10px] ${flags?.REAL_PAYMENTS_ENABLED ? 'text-red-500' : 'text-emerald-500'}`}>
                  {flags?.REAL_PAYMENTS_ENABLED ? 'LIVE (REAL)' : 'SANDBOX (MOCK)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-mono">v1.0.0-rc.1</span>
              </div>
            </div>
          </StonePanel>

          <StonePanel className="p-6 border-l-4 border-l-amber-500">
            <h2 className="font-pixel text-sm mb-4 flex items-center gap-2 text-amber-500">
              <ShieldCheck className="w-4 h-4" /> POLÍTICA DE SEGURANÇA
            </h2>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                Alterações são propagadas instantaneamente via servidor.
              </li>
              <li className="flex gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                Em produção, o Modo Mock é bloqueado por segurança se as chaves MP estiverem presentes.
              </li>
              <li className="flex gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                Todas as ações são registradas com ID do autor e motivo obrigatório.
              </li>
            </ul>
          </StonePanel>
        </div>
      </div>
    </Container>
  );
}
