# Runbook de Rollback - Avance

Este documento estabelece os procedimentos para reverter o sistema para um estado estável anterior em caso de falha crítica pós-deploy.

## 🚨 Critérios de Ativação
- Taxa de erro (5xx) > 5% por mais de 10 minutos.
- Falha total no processamento de pagamentos ou entregas.
- Corrupção de dados persistentes no banco ou mundos.
- Regressão crítica de segurança ou performance.

## 👥 Responsáveis
- **Orquestrador:** Engenheiro de DevOps / Lead.
- **Validação de Dados:** DBA / Backend Engineer.
- **Validação de Jogo:** Admin do Servidor Minecraft.

## 🛠️ Procedimento de Rollback

### Etapa 1: Código e Frontend (Hostinger/VPS) - Est. 5 min
1. **Identificar a imagem estável anterior:** `docker images` para encontrar o hash anterior.
2. **Reverter via Docker Compose:**
   ```bash
   # Edite o docker-compose.yml para apontar para a imagem anterior ou use a tag :previous
   docker-compose up -d --force-recreate
   ```
3. **Validar:** Acessar o site e verificar se a versão anterior foi carregada.

### Etapa 2: Banco de Dados (Supabase/Lovable Cloud) - Est. 10-20 min
**Atenção:** Rollback de banco é a última opção e pode ser destrutivo.
- **Cenário A (Mudança Não-Destrutiva):** Manter a versão atual do banco e apenas ajustar o código.
- **Cenário B (Mudança Destrutiva/Corrupção):**
  1. Ativar modo de manutenção global via Feature Flag.
  2. Restaurar snapshot PITR (Point-in-Time Recovery) para o instante exato anterior ao deploy.
  3. **Crucial:** Executar script de reconciliação de pedidos para capturar transações feitas durante a janela do deploy.

### Etapa 3: Plugin Minecraft e Servidor - Est. 5 min
1. Se o erro for no Bridge: Parar o servidor.
2. Reverter o arquivo `.jar` do plugin para a versão estável em `/plugins`.
3. Reiniciar o servidor.

## ⚠️ Riscos e Pontos Irreversíveis
1. **Pedidos Durante o Rollback:** Pagamentos confirmados no Mercado Pago após o ponto de restauração mas antes do rollback devem ser inseridos manualmente.
2. **Entregas (Delivery Queue):** O sistema de idempotência previne duplicidade, mas a fila pode precisar de limpeza se o rollback afetar o status das ordens.
3. **Logs de Auditoria:** Logs gerados durante a versão "ruim" podem ser perdidos se o banco for totalmente restaurado.

## ✅ Verificação Pós-Rollback
- [ ] Endpoint `/api/health` retornando 200.
- [ ] Checkout simulado completado com sucesso.
- [ ] Plugin Bridge enviando batimentos (heartbeat).
- [ ] Comunicação oficial enviada aos usuários (Discord/Site).

---
**Política de "Forward Fix":** Se o tempo estimado de fix for menor que o tempo de rollback (20 min), prefira o fix. Se o risco for desconhecido, execute o rollback imediatamente.
