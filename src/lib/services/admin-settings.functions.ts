import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminUpdateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      settings: z.record(z.string(), z.string())
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    
    // Preparar inserts/updates
    const upserts = Object.entries(data.settings).map(([key, value]) => ({
      key,
      value
    }));

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(upserts, { onConflict: 'key' });

    if (error) {
      console.error("[admin] updateSiteSettings", error.message);
      throw new Error("Falha ao salvar configurações");
    }

    // Registrar no log de auditoria
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "UPDATE_SITE_SETTINGS",
      target_type: "SYSTEM",
      details: { updated_keys: Object.keys(data.settings) }
    });

    return { success: true };
  });
