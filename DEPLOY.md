# Deploy Habblet Mine na Hostinger (VPS)

Este guia descreve como realizar o deploy do Habblet Mine em uma VPS Hostinger, utilizando Docker e TanStack Start.

## 🏗️ Arquitetura Final

- **Frontend & Server Functions:** Rodando na VPS via Docker (Node.js/Nitro).
- **Backend (Banco, Auth, Realtime):** Mantidos no **Lovable Cloud** (Supabase).
- **Integrações:** Mercado Pago (Webhooks) e Plugin Minecraft (HMAC).

## 📁 Arquivos de Configuração

### 1. Dockerfile
Crie um arquivo `Dockerfile` na raiz do projeto:

```dockerfile
# Estágio de Build
FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .
RUN pnpm install
RUN pnpm build

# Estágio de Produção
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Segurança: Usuário não-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
USER nodejs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
```

### 2. Docker Compose
Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_ACCESS_TOKEN}
      - PLUGIN_SECRET=${PLUGIN_SECRET}
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🚀 Passos de Deploy

1. **Preparar VPS:** Instalar Docker e Nginx.
2. **Variáveis de Ambiente:** Configurar o arquivo `.env` na VPS.
3. **Build & Run:**
   ```bash
   docker-compose up -d --build
   ```
4. **Proxy Reverso (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name habbletmine.com.br;
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
5. **SSL:** Utilizar Certbot para HTTPS obrigatório.

## ⚠️ Limitações & Observações
- As **Server Functions** do TanStack Start rodam localmente na VPS, mas se comunicam com o banco de dados remoto no Lovable Cloud.
- O projeto não pode ser movido integralmente (banco de dados) sem uma migração de dados do Supabase.
