# Habblet Mine - Production Dockerfile
# Baseado em TanStack Start / Nitro

FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependências de build
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml* ./

# Usar npm se pnpm não estiver presente (o template Lovable usa bun ou npm geralmente, mas aqui usamos node-slim)
RUN npm install

COPY . .

# Build da aplicação (gera .output/)
RUN npm run build

# --- Stage de Produção ---
FROM node:20-slim

WORKDIR /app

# Copiar apenas o output do build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Instalar curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Segurança: Rodar como usuário não-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

# Variáveis de Ambiente Padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Healthcheck usando o endpoint criado
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Iniciar o servidor Nitro
CMD ["node", ".output/server/index.mjs"]
