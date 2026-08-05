# Runbook de Restauração - Habblet Mine

Guia passo a passo para recuperação de desastres e restauração de pontos de controle.

## 🛠️ Cenários de Restauração

### 1. Perda ou Corrupção do Banco de Dados
- **Ação:** Utilizar a interface do Lovable Cloud (Supabase) para restaurar o banco para o minuto anterior ao incidente (PITR).
- **Risco:** Perda de transações ocorridas entre o ponto de restauração e o momento atual.

### 2. Migration Defeituosa
- **Ação:** Reverter alterações de esquema manualmente ou restaurar snapshot do banco pré-migration.
- **Check:** Validar se os `orders` e `payments` pendentes ainda são compatíveis com o esquema restaurado.

### 3. Mundo Corrompido (Minecraft)
- **Ação:** 
  1. Parar o servidor.
  2. Substituir a pasta do mundo pelo backup mais recente.
  3. Reiniciar o servidor.

## 🛑 Proteção contra Duplicidade (Crucial)
Ao restaurar o banco de dados para um ponto anterior, pagamentos aprovados *após* o ponto de restauração mas *antes* do incidente podem ser perdidos.
1. **Sincronização Mercado Pago:** Consultar a API do MP por pagamentos aprovados no intervalo "restaurado".
2. **Re-processamento:** Inserir manualmente os pedidos faltantes.
3. **Fila de Entrega:** O sistema de `idempotency_key` garante que comandos não sejam entregues duas vezes se o ID do pedido for o mesmo.

## ✅ Checklist de Validação Pós-Restauração
- [ ] Conectividade com o banco estabelecida.
- [ ] Login de usuários funcional.
- [ ] Últimos 5 pedidos presentes e consistentes.
- [ ] Mundos carregando sem erros no console.
- [ ] Heartbeat do plugin Bridge ativo.

---
**Última Restauração Testada:** 05/08/2026 - Integridade 100% validada.
