# Avance - Guia de Deploy Seguro

## 🌍 Ambientes
- **development**: Localhost, mock payments ativos, logs detalhados.
- **staging**: Preview em nuvem, Mercado Pago em sandbox, plugin de teste.
- **production**: Avance real, pagamentos reais, auditoria estrita, sem dados demo.

## 🔑 Variáveis de Ambiente (Secrets)
| Variável | Descrição | Obrigatória em Prod |
|----------|-----------|----------------------|
| `APP_BASE_URL` | URL base do site (ex: https://avance.com.br) | ✅ |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de produção do Mercado Pago | ✅ |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para validar x-signature do MP | ✅ |
| `PLUGIN_SECRET_KEY` | Chave HMAC para comunicação com o Plugin | ✅ |
| `PLUGIN_ID` | Identificador único do servidor Minecraft | ✅ |
| `HMAC_CLOCK_TOLERANCE_SECONDS` | Tolerância de replay (padrão: 300s) | ❌ |

## 🚩 Feature Flags
Configuradas em `src/lib/config/flags.ts`:
- `STORE_ENABLED`: Habilita/Desabilita a loja inteira.
- `REAL_PAYMENTS_ENABLED`: Se falso, usa fluxo de sucesso simulado.
- `PLUGIN_DELIVERY_ENABLED`: Habilita entrega automática de itens.
- `MAINTENANCE_MODE`: Bloqueia acesso público com aviso voxel.
- `DEMO_RANKINGS_ENABLED`: Mostra rankings fictícios se o banco estiver vazio.

## 🛡️ Bloqueios de Produção
O sistema `validateProductionConfig()` impede o boot se:
1. `NODE_ENV=production` mas faltam tokens do Mercado Pago.
2. Webhook secret não configurado.
3. Chave do Plugin ausente.

## ✅ Checklist de Deploy
1. Configurar Secrets no painel da Lovable Cloud.
2. Validar URL de redirecionamento no Mercado Pago.
3. Configurar Endpoint de Webhook no MP: `${APP_BASE_URL}/api/public/payments/webhook`.
4. Sincronizar `PLUGIN_SECRET_KEY` com o arquivo `config.yml` do Plugin Java.
5. Executar seed inicial de categorias e produtos.
