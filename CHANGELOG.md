# Changelog - Habblet Mine

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0-rc.1] - 2026-08-05

### ✨ Funcionalidades Concluídas
- **Portal Core:** Sistema de rotas TanStack Start com SSR, SEO otimizado e UI Kit Voxel customizado.
- **E-commerce:** Loja completa com categorias, produtos, cupons de desconto e carrinho lateral persistente.
- **Pagamentos:** Integração real com Mercado Pago via Webhook seguro (HMAC-SHA256).
- **Minecraft Auth:** Sistema de vinculação de contas com validação in-game via código efêmero.
- **Plugin API:** API segura com assinatura HMAC para entrega de itens e sincronização de status.
- **Fila de Entrega:** Sistema resiliente com backoff exponencial, lease atômico e auditoria completa.
- **Admin Panel:** Dashboard completo com métricas, CRUD de produtos/notícias, gestão de suporte e saúde técnica.
- **Observabilidade:** Logs padronizados, correlação de erros e monitoramento de latência do banco e plugin.

### 🔗 Integrações Disponíveis
- **Supabase:** Database, Auth e RLS.
- **Mercado Pago:** Pagamentos e Webhooks.
- **Minecraft Plugin:** Comunicação bidirecional segura.
- **Discord:** Integração de comunidade e redirecionamentos.

### 🛡️ Segurança e Estabilidade
- **RLS:** Políticas estritas em todas as tabelas públicas.
- **HMAC:** Assinatura digital obrigatória em todos os endpoints sensíveis (Plugin e Webhooks).
- **Safe Boot:** Validação de variáveis de ambiente obrigatórias no startup da aplicação.
- **Mocks:** Removidos 100% dos dados mockados nas rotas de produção.

### ⚠️ Riscos Conhecidos
- Dependência de latência da API do Mercado Pago para confirmação instantânea.
- Necessidade de sincronização manual de chaves entre Web e Plugin Java.

### ⏳ Pendências não Críticas
- Internacionalização para Inglês/Espanhol (opcional para v1.1).
- Sistema de tickets avançado com anexos de imagem.
