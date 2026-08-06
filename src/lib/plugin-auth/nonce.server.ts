import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

export async function checkAndRegisterNonce(
  supabase: SupabaseClient<Database>,
  serverId: string,
  nonce: string,
  timestamp: number
): Promise<boolean> {
  // Verificar se já existe
  const { data: existing } = await supabase
    .from("plugin_nonces")
    .select("id")
    .eq("server_id", serverId)
    .eq("nonce", nonce)
    .maybeSingle();

  if (existing) {
    return false;
  }

  // Registrar (o chamador deve chamar isto após validar a assinatura)
  const expiresAt = new Date((timestamp + 600) * 1000).toISOString(); // 10 min de expiração
  const { error } = await supabase.from("plugin_nonces").insert({
    server_id: serverId,
    nonce: nonce,
    request_timestamp: new Date(timestamp * 1000).toISOString(),
    expires_at: expiresAt,
  });

  return !error;
}
