# Política de Backup - Avance

Esta política define os procedimentos e requisitos para a salvaguarda de dados e continuidade operacional.

## 📋 Escopo
- **Banco de Dados (Supabase):** Perfis, pedidos, cupons, configurações e logs.
- **Arquivos do Site (Hostinger):** Código-fonte, configurações de deploy e assets.
- **Servidor Minecraft:** Mundos (world, nether, end), plugins e configurações do Bridge.
- **Mídia:** Imagens de produtos e notícias armazenadas no Storage.

## 🗓️ Cronograma e Retenção
| Recurso | Frequência | Retenção | Método |
| :--- | :--- | :--- | :--- |
| Banco de Dados | Diário (03:00) | 30 dias | Supabase Point-in-Time Recovery |
| Mundos Minecraft | A cada 6 horas | 7 dias | Incremental (Rsync/Rclone) |
| Plugins/Config | Semanal | 90 dias | Snapshot |
| Logs Críticos | Diário | 1 ano | Exportação para S3/Cold Storage |

## 🛡️ Regras de Ouro
1. **Pré-Deploy:** Backup manual do banco e mundos antes de qualquer alteração estrutural.
2. **Migration:** Exportação SQL completa antes de rodar migrations de esquema.
3. **Cópia Externa:** Pelo menos uma cópia deve residir fora da infraestrutura principal (Multi-cloud).
4. **Criptografia:** Backups em trânsito e em repouso devem ser criptografados (AES-256).

## 🚨 Alertas e Monitoramento
- Notificação imediata via Discord/E-mail em caso de falha no job de backup.
- Validação semanal de integridade (checksum) dos arquivos de backup.
