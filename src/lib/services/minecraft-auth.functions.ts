import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Database } from "@/integrations/supabase/types";

type MinecraftEdition = Database["public"]["Enums"]["minecraft_edition"];

/**
 * Lista as contas Minecraft do usuário logado.
 * No schema atual, a tabela é 'player_accounts'.
 */
export const getMyMinecraftAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    const { data, error } = await supabase
      .from("player_accounts")
      .select("*")
      .eq("profile_id", userId)
      .order("verified_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

/**
 * Gera um código de verificação para vincular uma conta Minecraft.
 * Como não temos colunas de código na player_accounts ainda, usaremos audit_logs ou metadata temporário
 * se necessário, mas aqui simularemos a intenção de fluxo seguro.
 */
export const generateVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ 
      nickname: z.string().min(3).max(16),
      edition: z.enum(["java", "bedrock"])
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // 1. Verificar se o nick já está vinculado e verificado por outro usuário
    const { data: existing } = await supabase
      .from("player_accounts")
      .select("id, profile_id, verified_at")
      .eq("minecraft_nickname", data.nickname)
      .eq("edition", data.edition as MinecraftEdition)
      .single();

    if (existing?.verified_at && existing.profile_id !== userId) {
      throw new Error("Este nickname já está vinculado e verificado em outra conta.");
    }

    // 2. Gerar código único de 6 caracteres
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 3. Registrar intenção no log de auditoria (usado como store temporário para o plugin validar)
    await supabase.from("audit_logs").insert({
      actor_profile_id: userId,
      action: "verification_request",
      entity: "player_account",
      metadata: { 
        nickname: data.nickname, 
        edition: data.edition, 
        code, 
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() 
      }
    });

    return { code };
  });

/**
 * Remove uma conta (apenas se não estiver verificada ou se o usuário desejar desvincular).
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

    if (error) throw error;
    return { success: true };
  });
