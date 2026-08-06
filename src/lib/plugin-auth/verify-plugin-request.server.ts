import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { PluginAuthResult, PluginAuthHeaders } from "./types";
import { computePluginSignature, safeCompareSignatures } from "./hmac.server";
import { checkAndRegisterNonce } from "./nonce.server";
import { checkRateLimit } from "./rate-limit.server";

const MAX_PAYLOAD_SIZE = 1024 * 512; // 512KB

export async function verifyPluginRequest(
  request: Request,
  supabase: SupabaseClient<Database>
): Promise<PluginAuthResult> {
  // 1. Validar Content-Type
  const contentType = request.headers.get("Content-Type");
  if (!contentType?.includes("application/json")) {
    return { valid: false, errorCode: "invalid_content_type", status: 400 };
  }

  // 2. Extrair Headers
  const pluginId = request.headers.get("X-Plugin-Id");
  const timestamp = request.headers.get("X-Timestamp");
  const nonce = request.headers.get("X-Nonce");
  const signature = request.headers.get("X-Signature");

  if (!pluginId || !timestamp || !nonce || !signature) {
    return { valid: false, errorCode: "invalid_request", status: 400 };
  }

  // 3. Validar Tamanho do Corpo (prevenção de DoS)
  const contentLength = parseInt(request.headers.get("Content-Length") || "0", 10);
  if (contentLength > MAX_PAYLOAD_SIZE) {
    return { valid: false, errorCode: "payload_too_large", status: 413 };
  }

  // 4. Validar Timestamp (janela de 60 segundos)
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(requestTime) || Math.abs(now - requestTime) > 60) {
    return { valid: false, errorCode: "expired_timestamp", status: 408 };
  }

  // 5. Rate Limit Inicial (por IP)
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!(await checkRateLimit(pluginId, ip))) {
    return { valid: false, errorCode: "invalid_request", status: 429 }; // Usando 429 para rate limit
  }

  // 6. Buscar Servidor e Segredos (incluindo rotação)
  const { data: server, error: serverError } = await supabase
    .from("minecraft_servers")
    .select("server_id, secret_hash, previous_secret_hash, previous_secret_expires_at, enabled")
    .eq("server_id", pluginId)
    .single();

  if (serverError || !server) {
    return { valid: false, errorCode: "unknown_plugin", status: 401 };
  }

  if (!server.enabled) {
    return { valid: false, errorCode: "plugin_disabled", status: 403 };
  }

  // 7. Ler Body Bruto
  const rawBody = await request.text();
  if (rawBody.length > MAX_PAYLOAD_SIZE) {
    return { valid: false, errorCode: "payload_too_large", status: 413 };
  }

  // 8. Validar Assinatura (Suporta Rotação)
  let isSignatureValid = false;

  // Tentar com segredo atual
  const expectedCurrent = computePluginSignature(timestamp, nonce, rawBody, server.secret_hash);
  isSignatureValid = safeCompareSignatures(signature, expectedCurrent);

  // Tentar com segredo anterior se disponível e não expirado
  if (!isSignatureValid && server.previous_secret_hash && server.previous_secret_expires_at) {
    const previousExpires = new Date(server.previous_secret_expires_at).getTime();
    if (Date.now() < previousExpires) {
      const expectedPrevious = computePluginSignature(timestamp, nonce, rawBody, server.previous_secret_hash);
      isSignatureValid = safeCompareSignatures(signature, expectedPrevious);
    }
  }

  if (!isSignatureValid) {
    return { valid: false, errorCode: "invalid_signature", status: 401 };
  }

  // 9. Validar e Registrar Nonce (Anti-replay) - Apenas após assinatura válida
  const nonceRegistered = await checkAndRegisterNonce(supabase, server.server_id, nonce, requestTime);
  if (!nonceRegistered) {
    return { valid: false, errorCode: "replay_detected", status: 409 };
  }

  // 10. Sucesso: Atualizar Heartbeat
  await supabase.from("minecraft_servers").update({
    last_seen_at: new Date().toISOString()
  } as any).eq("server_id", server.server_id);

  return { valid: true, serverId: server.server_id, status: 200 };
}
