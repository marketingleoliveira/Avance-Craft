/**
 * Suporte Administrativo: gestão de tickets.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupportTicket, SupportMessage } from "@/lib/types/database";

async function assertStaff(supabase: any, userId: string): Promise<void> {
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  const { data: isMod } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "moderator",
  });
  
  if (!isAdmin && !isMod) throw new Error("Acesso restrito à equipe.");
}

async function logAudit(
  supabase: any, 
  userId: string, 
  action: string, 
  entityType: string, 
  entityId: string, 
  metadata: any = {}
) {
  await supabase.from("audit_logs").insert({
    actor_profile_id: userId,
    action,
    entity: entityType,
    entity_id: entityId,
    metadata
  });
}

export const adminListTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    status: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    
    let query = context.supabase
      .from("support_tickets")
      .select("*, profile:profiles(minecraft_nickname)", { count: 'exact' });
      
    if (data.status) query = query.eq("status", data.status as any);
    if (data.category) query = query.eq("category", data.category);
    if (data.search) query = query.ilike("subject", `%${data.search}%`);
    
    const { data: rows, count, error } = await query.order("updated_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return { tickets: (rows as any[]) ?? [], count: count ?? 0 };
  });

export const adminGetTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .select(`
        *,
        profile:profiles(*),
        order:orders(*),
        messages:support_messages(*)
      `)
      .eq("id", data.id)
      .single();
      
    if (error) throw new Error(error.message);
    
    if (ticket.messages) {
      ticket.messages.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    
    return ticket as any;
  });

export const adminReplyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    ticketId: z.string().uuid(),
    body: z.string().trim().min(1),
    internal: z.boolean().default(false),
    newStatus: z.enum(["open", "pending", "closed"]).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    
    const { data: message, error } = await context.supabase
      .from("support_messages")
      .insert({
        ticket_id: data.ticketId,
        author_profile_id: context.userId,
        body: data.body,
        from_staff: true,
      })
      .select("*")
      .single();
      
    if (error) throw new Error(error.message);
    
    const update: any = { updated_at: new Date().toISOString() };
    if (data.newStatus) update.status = data.newStatus;
    else update.status = "pending"; 
    
    await context.supabase.from("support_tickets").update(update).eq("id", data.ticketId);
    
    await logAudit(context.supabase, context.userId, "staff_reply", "support_ticket", data.ticketId, { internal: data.internal });
    
    return message;
  });
