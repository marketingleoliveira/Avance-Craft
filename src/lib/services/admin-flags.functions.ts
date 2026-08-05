import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { isFeatureEnabled, getPublicFeatureFlags, FeatureFlag } from "@/lib/config/flags";
import { assertAdmin } from "@/lib/services/admin.functions";

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

    // Em produção, não permitir desativar segurança básica ou ativar pagamentos reais sem confirmação extra
    // Aqui poderíamos ter validações específicas baseadas na flag
    
    await context.supabase.from("audit_logs").insert({
      user_id: context.userId,
      action: `update_flag_${value ? 'enabled' : 'disabled'}`,
      entity_type: "feature_flag",
      entity_id: flag,
      new_data: { value, reason },
      old_data: { value: isFeatureEnabled(flag as FeatureFlag) }
    });

    return { success: true };
  });
