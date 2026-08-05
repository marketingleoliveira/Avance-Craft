# Plano de Ativação Gradual (Phased Rollout) - Avance

Este plano define a estratégia de lançamento progressivo do portal e do servidor, utilizando Feature Flags para mitigar riscos e garantir a estabilidade operacional.

## 🛠 Gerenciamento de Flags (site_settings)
As seguintes chaves no banco de dados controlam o comportamento global:
- `MAINTENANCE_MODE`: Bloqueio total do site.
- `REGISTRATION_ENABLED`: Permite novos perfis.
- `BETA_INVITE_ONLY`: Restringe cadastro a convites válidos.
- `STORE_ENABLED`: Exibe a vitrine e permite carrinho.
- `SANDBOX_PAYMENTS`: Força checkout de teste (sem cobrança real).
- `PLUGIN_DELIVERY`: Ativa a comunicação com a delivery_queue.

---

## 📅 Sequência de Fases

### Fase 1: Site Público & Institucional
- **Objetivo:** Indexação SEO e apresentação do projeto.
- **Flags:** `MAINTENANCE_MODE: false`, `STORE_ENABLED: false`, `REGISTRATION_ENABLED: false`.
- **Critério de Saída:** Sem erros de carregamento nas páginas institucionais por 24h.

### Fase 2: Cadastro Beta Fechado
- **Objetivo:** Popular a base inicial com usuários selecionados.
- **Flags:** `REGISTRATION_ENABLED: true`, `BETA_INVITE_ONLY: true`.
- **Atividade:** Distribuição manual de 50 convites via Discord.

### Fase 3: Alpha Técnico (Plugin & Fila)
- **Objetivo:** Testar a ponte Minecraft <-> Site sem transações financeiras.
- **Flags:** `PLUGIN_DELIVERY: true`, `STORE_ENABLED: true`, `SANDBOX_PAYMENTS: true`.
- **Atividade:** Usuários beta "compram" produtos de R$ 0,00 para validar entrega.

### Fase 4: Loja em Sandbox (Stress Test)
- **Objetivo:** Validar o fluxo completo de pagamento simulado.
- **Flags:** `SANDBOX_PAYMENTS: true` (Mercado Pago Test Mode).
- **Atividade:** Simulação de 100 pedidos simultâneos na fila de entrega.

### Fase 5: Pagamento Real Controlado ("Soft Launch")
- **Objetivo:** Validar integração financeira real com baixo risco.
- **Flags:** `SANDBOX_PAYMENTS: false`.
- **Restrição:** Apenas 1 categoria ativa (ex: "VIP Bronze") com valor promocional.
- **Critério de Saída:** 20 pedidos reais processados e entregues sem intervenção manual.

### Fase 6: Lançamento Público (Full Release)
- **Objetivo:** Operação total.
- **Flags:** `BETA_INVITE_ONLY: false`, `STORE_ENABLED: true` (todas categorias).
- **Atividade:** Campanha de marketing e abertura oficial do servidor.

---

## 🚨 Plano de Rollback por Fase
Caso ocorra uma falha crítica em qualquer fase:
1. Reverter a Feature Flag correspondente imediatamente.
2. Ativar `MAINTENANCE_MODE: true` se houver risco de corrupção de dados.
3. Notificar via Discord através do sistema de alertas automáticos.

## 📊 Métricas de Sucesso
- **Latência do Webhook:** < 2s.
- **Tempo de Entrega (Plugin):** < 30s após aprovação.
- **Taxa de Conversão:** Cadastro -> Checkout -> Sucesso.
