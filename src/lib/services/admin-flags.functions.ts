import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getPublicFeatureFlags, FeatureFlag } from "@/lib/config/flags";
import { assertAdmin } from "@/lib/services/admin.functions";
import { getEnv } from "@/lib/config/env.server";


/**
 * Função para buscar as flags atuais no admin.
 */
export const adminListFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    return getPublicFeatureFlags();
  });

/**
 * Função para atualizar uma flag via painel administrativo.
 * Persiste na tabela audit_logs para rastreabilidade.
 */
export const adminUpdateFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    flag: z.string(),
    value: z.boolean(),
    reason: z.string().min(5, "Motivo é obrigatório para auditoria")
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    const { flag, value, reason } = data;
    const env = getEnv();

    // 1. Persistir no banco
    const { error: dbError } = await context.supabase
      .from("feature_flags")
      .upsert({ 
        key: flag, 
        value, 
        environment: env.APP_ENV,
        updated_by: context.userId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key,environment' });

    if (dbError) throw new Error(`Falha ao persistir flag: ${dbError.message}`);

    // 2. Registrar Auditoria
    await context.supabase.from("audit_logs").insert({
      actor_profile_id: context.userId,
      action: `update_flag_${value ? 'enabled' : 'disabled'}`,
      entity: "feature_flag",
      entity_id: flag,
      metadata: { 
        value, 
        reason,
        environment: env.APP_ENV
      }
    });

    return { success: true };

  });
