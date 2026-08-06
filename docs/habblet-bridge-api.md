# AvanceBridge API Documentation (v1.0.0)

Documentação técnica oficial para integração entre o servidor Minecraft (via plugin Paper) e o Portal Avance.

## 1. Protocolo de Segurança (HMAC-SHA256)

Todas as requisições enviadas pelo plugin ao portal devem ser autenticadas via HMAC-SHA256 para garantir integridade, autenticidade e proteção contra replay.

### 1.1 Headers Obrigatórios

| Header | Descrição | Exemplo |
| :--- | :--- | :--- |
| `X-Plugin-Id` | ID único da instância do servidor (server_id) | `habblet-survival-01` |
| `X-Timestamp` | Unix timestamp em segundos (UTC) | `1722977760` |
| `X-Nonce` | String aleatória única (UUID v4 recomendado) | `a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5` |
| `X-Signature` | Assinatura HMAC-SHA256 em **Hexadecimal** | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `Content-Type` | Sempre deve ser `application/json` | `application/json` |

### 1.2 Regra de Assinatura (Canonical String)

A assinatura é calculada sobre uma string canônica composta pelos headers de segurança e o corpo bruto (raw body) da requisição.

**Formato:**
`timestamp` + `.` + `nonce` + `.` + `raw_json_body`

**Exemplo de cálculo (TypeScript):**
```typescript
const canonicalString = `${timestamp}.${nonce}.${rawBody}`;
const signature = crypto.createHmac('sha256', secret)
  .update(canonicalString)
  .digest('hex');
```

### 1.3 Regras Críticas
1. **Codificação:** UTF-8 obrigatório.
2. **Janela de Tempo:** Requisições com `X-Timestamp` divergente em mais de **60 segundos** do relógio do servidor serão rejeitadas (Error 408).
3. **Anti-Replay:** O `X-Nonce` é verificado e armazenado. Nonces duplicados resultam em rejeição (Error 409).
4. **Serialização JSON:** O plugin deve enviar o JSON sem espaços ou quebras de linha desnecessárias (Minified). A assinatura deve ser calculada sobre os **exatos mesmos bytes** enviados no corpo HTTP.

---

## 2. Endpoints e Ações

**URL Base:** `https://avancemine.lovable.app/api/public/plugin`
**Método:** `POST`

As requisições utilizam um campo `action` para discriminar a operação.

### 2.1 Heartbeat
Atualiza o status do servidor e sincroniza métricas.
- **Action:** `heartbeat`
- **Frequência Sugerida:** A cada 30 segundos.

**Request Body:**
```json
{"action":"heartbeat","server_id":"habblet-survival-01","online_players":42,"max_players":100,"tps":19.95}
```

### 2.2 Get Deliveries
Busca comandos pendentes na fila de entrega.
- **Action:** `get_deliveries`
- **Idempotência:** O portal reserva os comandos para a instância solicitante por 5 minutos via `FOR UPDATE SKIP LOCKED`.

**Request Body:**
```json
{"action":"get_deliveries","server_id":"habblet-survival-01","limit":50}
```

### 2.3 Confirm Delivery
Confirma a execução bem-sucedida de um comando.
- **Action:** `confirm_delivery`

**Request Body:**
```json
{"action":"confirm_delivery","server_id":"habblet-survival-01","delivery_id":"uuid-da-entrega"}
```

### 2.4 Link Account
Vincula um perfil do site a um UUID Minecraft.
- **Action:** `link_account`

**Request Body:**
```json
{"action":"link_account","server_id":"habblet-survival-01","minecraft_uuid":"uuid-do-player","minecraft_username":"nome-do-player","verification_code":"ABC123"}
```

---

## 3. Códigos de Erro

| HTTP Code | Descrição |
| :--- | :--- |
| `200` | Sucesso. |
| `401` | Falha na assinatura HMAC ou Server ID inválido. |
| `408` | Timestamp fora da janela permitida (60s). |
| `409` | Nonce duplicado (Replay Attack). |
| `429` | Rate limit excedido. |
| `500` | Erro interno no portal. |

---

## 4. Exemplos de Implementação

### 4.1 Java 25 (Paper Plugin)

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

public class AvanceSecurity {
    public static String computeSignature(String secret, String timestamp, String nonce, String body) throws Exception {
        String data = timestamp + "." + nonce + "." + body;
        
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
```

### 4.2 TypeScript (Test Vector)

```typescript
import { createHmac } from 'crypto';

const secret = 'avance_test_secret_32_chars_long!!';
const timestamp = '1722977760';
const nonce = 'a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5';
const body = '{"action":"heartbeat","server_id":"habblet-survival-01","online_players":42,"max_players":100,"tps":19.95}';

const data = `${timestamp}.${nonce}.${body}`;
const signature = createHmac('sha256', secret).update(data).digest('hex');
// Expected Signature: 3ae78a4b74356c2218914c00975dbe92cbc25485bd681df1eeddd321822e1d1c
```
