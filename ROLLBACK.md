# Plano de Rollback - Avance

Procedimentos de emergência para falhas críticas em produção.

## 🚨 Gatilhos de Rollback
1. Erros 5xx constantes na rota `/loja` ou `/api/public/*`.
2. Falha na entrega de itens (fila travada por > 30 minutos).
3. Vazamento de dados ou falha confirmada no RLS.
4. Incompatibilidade crítica com nova versão do Plugin Minecraft.

## 🔄 Procedimento Web (Lovable Cloud)
1. **Identificar versão estável:** Localizar o commit/deploy anterior bem-sucedido.
2. **Redeploy:** Ativar o deploy da versão anterior através do painel de controle.
3. **Purge Cache:** Limpar caches de borda se aplicável.

## 💾 Procedimento Banco de Dados (Supabase)
1. **Restaurar Backup:** Utilizar a funcionalidade de "Point-in-Time Recovery" (PITR) se disponível.
2. **Manual Fix:** Se for um erro de schema em migration, reverter manualmente a alteração via SQL Editor:
   ```sql
   -- Exemplo de reversão de alteração de coluna
   ALTER TABLE products ALTER COLUMN price TYPE numeric(10,2);
   ```

## 🔌 Procedimento Plugin
1. **Downgrade:** Substituir o `.jar` do plugin no servidor Minecraft pela versão anterior.
2. **Config Sync:** Garantir que o `PLUGIN_SECRET_KEY` da versão anterior ainda é válido ou redefinir ambos.

## 📢 Comunicação
1. Ativar `MAINTENANCE_MODE = true` em `src/lib/config/flags.ts`.
2. Notificar jogadores via Discord sobre a instabilidade.
3. Informar previsão de retorno após estabilização.
