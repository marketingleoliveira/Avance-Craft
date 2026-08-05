import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Database } from "@/integrations/supabase/types";

type MinecraftAccount = Database["public"]["Tables"]["minecraft_accounts"]["Row"];

/**
 * Lista as contas Minecraft do usuário logado.
 */
export const getMyMinecraftAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context!;
    const { data, error } = await supabase
      .from("minecraft_accounts")
      .select("*")
      .eq("profile_id", userId)
      .order("is_primary", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

/**
 * Gera um código de verificação para vincular uma conta Minecraft.
 */
export const generateVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ 
      nickname: z.string().min(3).max(16),
      platform: z.enum(["java", "bedrock"])
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // 1. Verificar se o nick já está vinculado e verificado por outro usuário
    const { data: existing } = await supabase
      .from("minecraft_accounts")
      .select("id, profile_id, verified")
      .eq("nickname", data.nickname)
      .eq("platform", data.platform)
      .single();

    if (existing?.verified && existing.profile_id !== userId) {
      throw new Error("Este nickname já está vinculado e verificado em outra conta.");
    }

    // 2. Gerar código único de 6 caracteres
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    // 3. Upsert na tabela de contas com o código (usando status 'pending')
    const { error } = await supabase
      .from("minecraft_accounts")
      .upsert({
        profile_id: userId,
        nickname: data.nickname,
        platform: data.platform,
        verification_code: code,
        verification_expires_at: expiresAt,
        verified: false,
        updated_at: new Date().toISOString()
      } as any, { onConflict: 'profile_id,nickname,platform' });

    if (error) throw error;

    return { code, expiresAt };
  });

/**
 * Define uma conta como principal.
 */
export const setPrimaryAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ accountId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;

    // Transação manual: remove primary de todas e seta na escolhida
    await supabase
      .from("minecraft_accounts")
      .update({ is_primary: false } as any)
      .eq("profile_id", userId);

    const { error } = await supabase
      .from("minecraft_accounts")
      .update({ is_primary: true } as any)
      .eq("id", data.accountId)
      .eq("profile_id", userId)
      .eq("verified", true); // Só pode ser principal se verificada

    if (error) throw error;
    return { success: true };
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
      .from("minecraft_accounts")
      .delete()
      .eq("id", data.accountId)
      .eq("profile_id", userId);

    if (error) throw error;
    return { success: true };
  });
