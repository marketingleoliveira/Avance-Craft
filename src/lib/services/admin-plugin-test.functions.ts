import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { createHmac, createHash } from "crypto";

/**
 * Valida se estamos em ambiente de Staging ou Dev
 */
function ensureStaging() {
  const isProd = process.env['NODE_ENV'] === 'production';
  const isStaging = process.env['VITE_STAGING'] === 'true';
  if (isProd && !isStaging) {
    throw new Error("Ação permitida apenas em ambientes de Staging ou Desenvolvimento.");
  }
}

/**
 * Busca o status detalhado da integração com o plugin
 */
export const adminGetPluginIntegrationStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    ensureStaging();

    // 1. Status do Servidor (Heartbeat)
    const { data: serverStatus } = await supabaseAdmin
      .from('server_status' as any)
      .select('updated_at, players_online, online')
      .maybeSingle();

    // 2. Estatísticas da Fila de Entrega
    const { data: queueStats } = await supabaseAdmin
      .from('delivery_queue')
      .select('status, attempts');

    const stats = {
      queued: queueStats?.filter(i => i.status === 'queued').length || 0,
      delivered: queueStats?.filter(i => i.status === 'delivered').length || 0,
      failed: queueStats?.filter(i => i.status === 'failed').length || 0,
      total_attempts: queueStats?.reduce((acc, i) => acc + (i.attempts || 0), 0) || 0,
    };

    // 3. Últimos logs de auditoria do plugin
    const { data: pluginLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .or('entity.eq.plugin_nonce,entity.eq.minecraft_server,action.ilike.%plugin%')
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      heartbeat: serverStatus,
      stats,
      logs: pluginLogs || []
    };
  });

/**
 * Simula uma requisição do plugin para testar cenários específicos
 */
export const adminSimulatePluginRequest = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    scenario: z.string(),
    pluginId: z.string().optional(),
    secretKey: z.string().optional(),
    customPayload: z.any().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    ensureStaging();

    const { scenario, pluginId = "test-server-id", secretKey = "test-secret-key", customPayload } = data;
    const baseUrl = process.env['VITE_SITE_URL'] || "http://localhost:8080";
    const endpoint = `${baseUrl}/api/public/plugin`;

    // Função auxiliar para gerar headers de assinatura
    const generateHeaders = (id: string, key: string, body: string, override?: any) => {
      const timestamp = override?.timestamp || Math.floor(Date.now() / 1000).toString();
      const nonce = override?.nonce || Math.random().toString(36).substring(7);
      const bodyHash = createHash("sha256").update(body).digest("hex");
      
      const canonicalString = [
        "POST",
        "/api/public/plugin",
        timestamp,
        nonce,
        bodyHash
      ].join("\n");

      const signature = createHmac("sha256", key)
        .update(canonicalString)
        .digest("hex");

      return {
        "Content-Type": "application/json",
        "X-Plugin-Id": id,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Signature": override?.signature || signature
      };
    };

    let body = JSON.stringify(customPayload || { type: "HEARTBEAT" });
    let headers: any = {};
    let description = "";

    switch (scenario) {
      case "HEARTBEAT_VALID":
        headers = generateHeaders(pluginId, secretKey, body);
        description = "Simulando Heartbeat com assinatura válida.";
        break;
      case "INVALID_SIGNATURE":
        headers = generateHeaders(pluginId, "WRONG_SECRET", body);
        description = "Simulando assinatura com secret key incorreta.";
        break;
      case "EXPIRED_TIMESTAMP":
        headers = generateHeaders(pluginId, secretKey, body, { 
          timestamp: (Math.floor(Date.now() / 1000) - 600).toString() 
        });
        description = "Simulando requisição com timestamp de 10 minutos atrás.";
        break;
      case "REPLAY_NONCE":
        const activeNonce = "nonce-" + Math.random().toString(36);
        // Primeira requisição para registrar o nonce
        await fetch(endpoint, { method: "POST", headers: generateHeaders(pluginId, secretKey, body, { nonce: activeNonce }), body });
        // Segunda requisição com o mesmo nonce
        headers = generateHeaders(pluginId, secretKey, body, { nonce: activeNonce });
        description = "Simulando ataque de replay com o mesmo Nonce.";
        break;
      default:
        throw new Error("Cenário não implementado");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body
    });

    const result = await response.text();
    
    return {
      success: response.ok,
      status: response.status,
      description,
      payload: result
    };
  });
