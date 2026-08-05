# Configuração de Ambiente - Avance

Este documento descreve as variáveis de ambiente necessárias para operar o portal em diferentes estágios.

## Ambientes Suportados

- **development**: Ambiente local para desenvolvedores.
- **staging**: Ambiente de homologação idêntico à produção, mas com integrações em modo sandbox.
- **production**: Ambiente real de jogadores.

---

## Variáveis Globais

| Variável | Descrição | Padrão (Dev) |
| :--- | :--- | :--- |
| `APP_ENV` | Define o ambiente (`development`, `staging`, `production`) | `development` |
| `APP_BASE_URL` | URL base do portal para redirecionamentos | `http://localhost:8080` |
| `LOG_LEVEL` | Nível de detalhamento dos logs (`error`, `info`, `debug`) | `info` |
| `SUPPORT_EMAIL` | E-mail oficial exibido no portal | `suporte@avance.com.br` |

## Integração Mercado Pago

| Variável | Descrição | Requerido em Prod? |
| :--- | :--- | :--- |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso da aplicação MP | **Sim** |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para validar assinaturas de notificação | **Sim** |

## Integração Plugin Minecraft (HMAC)

| Variável | Descrição | Requerido em Prod? |
| :--- | :--- | :--- |
| `PLUGIN_ID` | Identificador único do servidor Minecraft | **Sim** |
| `PLUGIN_SECRET_CURRENT` | Chave secreta principal para assinatura HMAC | **Sim** |
| `PLUGIN_SECRET_PREVIOUS` | Chave anterior (usada durante janelas de rotação) | Não |

## Feature Flags (Injetáveis via Env)

| Variável | Descrição | Efeito |
| :--- | :--- | :--- |
| `MAINTENANCE_MODE` | `true/false` | Ativa tela global de manutenção |
| `REAL_PAYMENTS_ENABLED` | `true/false` | Habilita pagamentos reais no checkout |

---

## Bloqueios de Startup (Safety First)

O sistema **não iniciará** se:
1. `APP_ENV` for `production` ou `staging` e variáveis críticas estiverem ausentes.
2. Houver erro de tipagem no arquivo `.env` (ex: URL malformada).
3. Rankings Demo estiverem ativos em ambiente `production`.

## Exemplo de Arquivo .env

```bash
APP_ENV=production
APP_BASE_URL=https://mine.avance.com.br
LOG_LEVEL=info

MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx
MERCADOPAGO_WEBHOOK_SECRET=xxxxxx

PLUGIN_ID=servidor-principal
PLUGIN_SECRET_CURRENT=chave-ultra-secreta-hmac
```
