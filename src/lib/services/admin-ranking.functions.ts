/**
 * Serviços para gestão administrativa de rankings e servidores.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { 
  Ranking, 
  ServerStatus, 
  AuditLog 
} from "@/lib/types/database";

// Contrato para checar o papel do chamador via RLS
type RoleChecker = {
  rpc: (
    fn: "has_role",
    args: { _user_id: string; _role: "admin" },
  ) => PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
};

async function assertAdmin(supabase: RoleChecker, userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`Falha ao validar permissões: ${error.message}`);
  if (!data) throw new Error("Acesso restrito a administradores.");
}

async function logAudit(
  supabase: any, 
  userId: string, 
  action: string, 
  entityType: string, 
  entityId: string, 
  newData: any = null, 
  oldData: any = null
) {
  await supabase.from("audit_logs").insert({
    actor_profile_id: userId,
    action,
    entity: entityType,
    entity_id: entityId,
    metadata: { newData, oldData }
  });
}

// --- Rankings ---

export const adminListAllRankings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => 
    z.object({ 
      category: z.string().optional(),
      period: z.string().optional()
    }).parse(input ?? {})
  )
  .handler(async ({ data, context }): Promise<Ranking[]> => {
    await assertAdmin(context.supabase, context.userId);
    let query = context.supabase.from("rankings").select("*");
    
    if (data.category) query = query.eq("category", data.category);
    if (data.period) query = query.eq("period", data.period);
    
    const { data: rows, error } = await query.order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminClearDemoRankings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    // Supondo que dados demo tenham um padrão ou limpamos tudo para resync
    const { error } = await context.supabase.from("rankings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    
    await logAudit(context.supabase, context.userId, "clear_demo", "ranking", "all");
    return { success: true };
  });

// --- Servidores / Status ---

export const adminListServers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ServerStatus[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("server_status").select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateServerConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    serverId: z.string(),
    ip: z.string().optional(),
    ipBedrock: z.string().optional(),
    portBedrock: z.number().optional(),
    version: z.string().optional(),
    heartbeatTimeout: z.number().int().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    const { serverId, ...fields } = data;
    const { error } = await context.supabase
      .from("server_status")
      .update({
        ip: fields.ip,
        version: fields.version,
      } as any)
      .eq("server_id", serverId);
      
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "update_config", "server", serverId, fields);
    return { success: true };
  });
