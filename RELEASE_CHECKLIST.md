# Release Checklist - Avance (RC)

Guia de validação final para promoção da versão `v1.0.0-rc.1` para Staging/Produção.

## 🏗️ Infraestrutura & Backend
- [ ] **Migrations:** Verificar se `supabase/migrations` reflete o schema atual do banco.
- [ ] **Secrets:** Validar se `MERCADOPAGO_ACCESS_TOKEN` e `PLUGIN_SECRET_KEY` estão configurados no painel.
- [ ] **RLS:** Executar auditoria de políticas: `SELECT * FROM user_roles` deve ser restrito.
- [ ] **Health Check:** Acessar `/admin/saude` e verificar se todos os indicadores estão verdes.

## 🛒 Loja & Checkout
- [ ] **Produtos:** Verificar se todos os preços e comandos estão corretos no banco.
- [ ] **Cupons:** Testar aplicação de cupom com limite de uso atingido.
- [ ] **Webhook:** Simular evento de pagamento aprovado via ferramenta de teste do MP.
- [ ] **Fila:** Confirmar que itens comprados aparecem em `delivery_queue` com status `pending`.

## 🎮 Integração Minecraft
- [ ] **Auth:** Vincular uma conta Minecraft no `/perfil` usando o comando `/verificar`.
- [ ] **Entrega:** Confirmar que o plugin "clama" a entrega e a marca como `delivered`.
- [ ] **Heartbeat:** Verificar se o tempo de resposta do servidor Minecraft aparece no dashboard admin.

## 🔍 SEO & UX
- [ ] **Meta Tags:** Validar títulos e descrições únicas em `/loja`, `/noticias` e `/ranking`.
- [ ] **Performance:** Rodar Lighthouse e garantir Score > 90 em Acessibilidade e SEO.
- [ ] **Responsividade:** Testar menu e checkout em dispositivos móveis (375px).

## 🛑 Bloqueios de Segurança
- [ ] Confirmar que `VITE_SUPABASE_SERVICE_ROLE` **NÃO** está exposta no frontend.
- [ ] Validar que rotas `/admin/*` redirecionam para `/auth` se o usuário não for staff.
- [ ] Verificar se o log de auditoria está registrando ações críticas (ex: alteração de preço).
