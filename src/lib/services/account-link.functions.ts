import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logger } from "@/lib/config/logger.server";
import { z } from "zod";

export const generateLinkCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const profileId = context.userId;
    
    // Gerar código alfanumérico curto (6 chars)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Hash do código para armazenamento seguro
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const { error } = await supabaseAdmin
      .from("player_accounts")
      .upsert({
        profile_id: profileId,
        verification_code_hash: hash,
        verification_expires_at: expiresAt.toISOString(),
        verified: false,
        minecraft_nickname: "pending_link",
        edition: "java"
      } as any, { onConflict: 'profile_id' });

    if (error) {
      await logger.error("auth-link", "Failed to generate link code", { context: { error, profileId } });
      throw new Error("Falha ao gerar código");
    }

    return { code, expiresAt: expiresAt.toISOString() };
  });

export const unlinkAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const profileId = context.userId;

    const { error } = await supabaseAdmin
      .from("player_accounts")
      .delete()
      .eq("profile_id", profileId);

    if (error) throw error;
    
    await logger.info("auth-link", "Account unlinked", { context: { profileId } });
    return { success: true };
  });
