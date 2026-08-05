import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Database } from "@/integrations/supabase/types";

type MinecraftEdition = Database["public"]["Enums"]["minecraft_edition"];

/**
 * Lista as contas Minecraft do usuário logado.
 */
export const getMyMinecraftAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    const { data, error } = await supabase
      .from("player_accounts")
      .select("id, minecraft_nickname, edition, uuid, verified_at, created_at")
      .eq("profile_id", userId)
      .order("verified_at", { ascending: false });

    if (error) {
      console.error("[Audit] Error listing player accounts", error);
      throw new Error("Internal server error");
    }
    return data ?? [];
  });

/**
 * Gera um código de verificação para vincular uma conta Minecraft.
 * Proteção: Limite de geração e expiração curta.
 */
export const generateVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ 
      nickname: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/),
      edition: z.enum(["java", "bedrock"])
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // Rate limiting simples: verificar se já existe solicitação recente
    const { data: recent } = await supabase
      .from("audit_logs")
      .select("created_at")
      .eq("actor_profile_id", userId)
      .eq("action", "verification_request")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recent && (Date.now() - new Date(recent.created_at).getTime() < 30000)) {
      throw new Error("Aguarde 30 segundos para gerar um novo código.");
    }

    const { data: existing } = await supabase
      .from("player_accounts")
      .select("id, profile_id, verified_at")
      .eq("minecraft_nickname", data.nickname)
      .eq("edition", data.edition as MinecraftEdition)
      .single();

    if (existing?.verified_at && existing.profile_id !== userId) {
      throw new Error("Este nickname já está vinculado em outra conta.");
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await supabase.from("audit_logs").insert({
      actor_profile_id: userId,
      action: "verification_request",
      entity: "player_account",
      metadata: { 
        nickname: data.nickname, 
        edition: data.edition, 
        code, 
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() 
      }
    });

    return { code };
  });

/**
 * Remove uma conta.
 */
export const removeMinecraftAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ accountId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    const { error } = await supabase
      .from("player_accounts")
      .delete()
      .eq("id", data.accountId)
      .eq("profile_id", userId);

    if (error) {
      console.error("[Audit] Error removing account", error);
      throw new Error("Falha ao remover conta.");
    }
    return { success: true };
  });
