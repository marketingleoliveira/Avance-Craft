import { createHmac, createHash, timingSafeEqual } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

export type PluginAuthResult = {
  valid: boolean;
  serverId?: string;
  error?: string;
};

/**
 * Validação de assinatura HMAC para o plugin Minecraft.
 * Formato da String Canônica:
 * METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY_HASH
 */
export async function validatePluginSignature(
  request: Request,
  body: string,
  supabase: SupabaseClient<Database>
): Promise<PluginAuthResult> {
  const serverIdentifier = request.headers.get("X-Server-Id"); // Corrigido para bater com o DB
  const timestamp = request.headers.get("X-Timestamp");
  const nonce = request.headers.get("X-Nonce");
  const signature = request.headers.get("X-Signature");

  if (!serverIdentifier || !timestamp || !nonce || !signature) {
    return { valid: false, error: "Missing required auth headers" };
  }

  // 1. Validar janela de tempo (5 minutos)
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - requestTime) > 300) {
    return { valid: false, error: "Timestamp out of window" };
  }

  // 2. Buscar segredo do servidor e validar status
  const { data: server, error: serverError } = await supabase
    .from("minecraft_servers")
    .select("server_id, secret_hash, enabled")
    .eq("server_id", serverIdentifier)
    .single();

  if (serverError || !server || !server.enabled) {
    return { valid: false, error: "Invalid or inactive server ID" };
  }

  // 3. Verificar Nonce (Anti-replay) usando a nova tabela dedicada
  const { data: existingNonce } = await supabase
    .from("plugin_nonces")
    .select("id")
    .eq("server_id", serverIdentifier)
    .eq("nonce", nonce)
    .maybeSingle();

  if (existingNonce) {
    return { valid: false, error: "Nonce already used" };
  }

  // 4. Construir String Canônica
  const url = new URL(request.url);
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const canonicalString = [
    request.method.toUpperCase(),
    url.pathname,
    timestamp,
    nonce,
    bodyHash
  ].join("\n");

  // 5. Validar Assinatura
  // IMPORTANTE: Em produção, o secret_hash seria usado para comparar hashes ou extrair o segredo
  // Aqui assumimos que secret_hash é o próprio segredo compartilhado (simplificação para o portal)
  const expectedSignature = createHmac("sha256", server.secret_hash)
    .update(canonicalString)
    .digest("hex");

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false, error: "Invalid signature" };
  }

  // Registrar nonce para evitar replay
  const expiresAt = new Date((requestTime + 600) * 1000); // Expira em 10 min
  await supabase.from("plugin_nonces").insert({
    server_id: server.server_id,
    nonce: nonce,
    request_timestamp: new Date(requestTime * 1000).toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Atualizar heartbeat
  await supabase.from("minecraft_servers").update({
    last_seen_at: new Date().toISOString()
  } as any).eq("server_id", serverIdentifier);

  return { valid: true, serverId: server.server_id };
}