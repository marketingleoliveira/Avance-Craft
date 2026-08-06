import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logger } from "@/lib/config/logger.server";
import { z } from "zod";

// Middleware para garantir que apenas admins ou desenvolvedores acessem
const requireAdminOrDev = async (ctx: any) => {
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', ctx.userId);
  
  // Como 'developer' pode não estar no enum app_role do banco ainda, verificamos admin
  // Em uma infra AAA, o desenvolvedor teria a role 'admin' ou uma role específica no banco
  const hasAccess = roles?.some(r => r.role === 'admin' || (r.role as string) === 'developer');
  if (!hasAccess) throw new Error("Unauthorized");
};

export const listMinecraftServers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdminOrDev(context);
    
    const { data, error } = await supabaseAdmin
      .from('minecraft_servers')
      .select('*, server_status(*)');
    
    if (error) throw error;
    return data;
  });

export const listDeliveryQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdminOrDev(context);
    
    const { data, error } = await supabaseAdmin
      .from('delivery_queue')
      .select('*, delivery_attempts(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const retryDelivery = createServerFn({ method: "POST" })
  .validator((data: { deliveryId: string }) => z.object({ deliveryId: z.string().uuid() }).parse(data))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data: input, context }) => {
    await requireAdminOrDev(context);
    
    const { error } = await supabaseAdmin
      .from('delivery_queue')
      .update({ status: 'queued', available_at: new Date().toISOString(), attempts: 0 } as any)
      .eq('id', input.deliveryId);
    
    if (error) throw error;
    
    await logger.info("admin-mc", "Delivery retried by admin", { context: { deliveryId: input.deliveryId, adminId: context.userId } });
    return { success: true };
  });

export const createMinecraftServer = createServerFn({ method: "POST" })
  .validator((data: { serverId: string; name: string; environment: 'production' | 'staging' | 'development' }) => 
    z.object({ 
      serverId: z.string(), 
      name: z.string(),
      environment: z.enum(['production', 'staging', 'development'])
    }).parse(data)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data: input, context }) => {
    await requireAdminOrDev(context);
    
    // Gerar segredo aleatório
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Hash do segredo usando Web Crypto API (disponível no Worker runtime)
    const encoder = new TextEncoder();
    const secretData = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest("SHA-256", secretData);
    const secretHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { error } = await supabaseAdmin
      .from('minecraft_servers')
      .insert({
        server_id: input.serverId,
        name: input.name,
        environment: input.environment,
        secret_hash: secretHash,
        active: true
      } as any);
    
    if (error) throw error;
    
    await logger.info("admin-mc", "New Minecraft server created", { context: { serverId: input.serverId, adminId: context.userId } });
    
    return { secret }; // Retornar segredo apenas uma vez
  });

