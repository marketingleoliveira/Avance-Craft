# Deploy Habblet Mine na Hostinger (VPS)

Este guia descreve como realizar o deploy do Habblet Mine em uma VPS Hostinger, respeitando a arquitetura atual com TanStack Start e Lovable Cloud.

## 🏗️ Arquitetura Final

- **Frontend & Server Functions:** Rodando na VPS via Docker (Node.js/Nitro).
- **Backend (Banco, Auth, Realtime):** Mantidos no **Lovable Cloud** (Supabase).
- **Integrações:** Mercado Pago (Webhooks) e Plugin Minecraft (HMAC).

## 📁 Arquivos de Configuração

### 1. Dockerfile
O arquivo `Dockerfile` na raiz do projeto utiliza uma estratégia de multi-stage build para otimizar o tamanho da imagem final.

### 2. Docker Compose
O arquivo `docker-compose.yml` gerencia o ciclo de vida do container e injeta as variáveis de ambiente necessárias.

### 3. Proxy Reverso (Nginx)
O arquivo `nginx/habbletmine.conf` contém a configuração otimizada para o Nginx com suporte a SSL, Gzip e headers de segurança.

## 🚀 Passos de Deploy (VPS Hostinger)

### Pré-requisitos
1. Uma VPS Hostinger com Ubuntu (recomendado).
2. Docker e Docker Compose instalados.
3. Nginx instalado.
4. Domínio apontado para o IP da VPS (A records).

### Configuração Inicial
1. **Clone do Repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd tanstack_start_ts
   ```

2. **Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_key_anon
   MERCADOPAGO_ACCESS_TOKEN=seu_token_mp
   PLUGIN_SECRET=seu_secret_hmac
   ```

3. **Build & Startup:**
   ```bash
   docker-compose up -d --build
   ```

### Configuração do Nginx & SSL
1. **Ativar Configuração:**
   ```bash
   sudo cp nginx/habbletmine.conf /etc/nginx/sites-available/habbletmine
   sudo ln -s /etc/nginx/sites-available/habbletmine /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

2. **HTTPS com Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d habbletmine.com.br -d www.habbletmine.com.br
   ```

## 🔄 Procedimentos Operacionais

### Atualização (Update)
```bash
git pull origin main
docker-compose up -d --build
```

### Rollback
```bash
# Se houver erro, retorne para a imagem anterior
docker-compose stop app
docker pull <tag-da-imagem-estavel>
docker-compose up -d
```

### Backup
As migrations são gerenciadas pelo Lovable Cloud. Para backups transacionais, utilize o exportador do Supabase.

## ⚠️ Limitações & Lovable Cloud
- **O que permanece no Lovable Cloud:** PostgreSQL, Auth, RLS e Storage.
- **O que roda na Hostinger:** A lógica de renderização React, Server Functions (SSR) e Webhooks.
- **Acesso às Server Functions:** O frontend (browser) acessa as Server Functions via HTTP POST na porta exposta pela VPS.
- **Nota:** O banco de dados não é migrado para a VPS; a aplicação continua consumindo a infraestrutura do Lovable Cloud.

