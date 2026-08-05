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
  const pluginId = request.headers.get("X-Plugin-Id");
  const timestamp = request.headers.get("X-Timestamp");
  const nonce = request.headers.get("X-Nonce");
  const signature = request.headers.get("X-Signature");

  if (!pluginId || !timestamp || !nonce || !signature) {
    return { valid: false, error: "Missing required auth headers" };
  }

  // 1. Validar janela de tempo (5 minutos)
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - requestTime) > 300) {
    return { valid: false, error: "Timestamp out of window" };
  }

  // 2. Buscar segredo do servidor e validar status
  // Forçamos o casting para evitar erros de tipagem quando a tabela ainda não está no schema TS gerado
  const { data, error: serverError } = await supabase
    .from("minecraft_servers" as any)
    .select("id, secret_key, active")
    .eq("id", pluginId)
    .single();

  const server = data as any;

  if (serverError || !server || !server.active) {
    return { valid: false, error: "Invalid or inactive plugin ID" };
  }

  // 3. Verificar Nonce (Anti-replay)
  const { data: existingNonce } = await supabase
    .from("audit_logs")
    .select("id")
    .eq("entity", "plugin_nonce")
    .eq("entity_id", nonce)
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
  const expectedSignature = createHmac("sha256", server.secret_key)
    .update(canonicalString)
    .digest("hex");

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false, error: "Invalid signature" };
  }

  // Registrar nonce para evitar replay
  await supabase.from("audit_logs").insert({
    action: "use_nonce",
    entity: "plugin_nonce",
    entity_id: nonce,
    metadata: { server_id: server.id }
  });

  return { valid: true, serverId: server.id };
}
