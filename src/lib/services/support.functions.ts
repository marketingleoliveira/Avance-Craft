/**
 * Suporte: tickets e mensagens do próprio jogador (staff enxerga tudo via RLS).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupportMessage, SupportTicket } from "@/lib/types/database";

import { requireOwnership } from "@/lib/utils/security";

export const listMyTickets = createServerFn({ method: "GET" })

  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<(SupportTicket & { messages: SupportMessage[] })[]> => {
    const { data: tickets, error: ticketError } = await context.supabase
      .from("support_tickets")
      .select(`
        *,
        messages:support_messages(*)
      `)
      .eq("profile_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (ticketError) throw new Error(`Falha ao carregar os chamados: ${ticketError.message}`);

    return (tickets as any) ?? [];
  });

export const getTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<SupportTicket & { messages: SupportMessage[] }> => {
    // Proteção IDOR via requireOwnership
    await requireOwnership(context.supabase, "support_tickets", data.id, context.userId);

    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .select(`
        *,
        messages:support_messages(*)
      `)
      .eq("id", data.id)
      .single();

    if (error) throw new Error(`Falha ao carregar o chamado: ${error.message}`);

    
    // Sort messages manually as Supabase JS select order for nested can be tricky
    if (ticket.messages) {
      ticket.messages.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return ticket as any;
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        category: z.string().min(1),
        subject: z.string().trim().min(4).max(120),
        message: z.string().trim().min(10).max(4000),
        orderId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<SupportTicket> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!profile) throw new Error("Perfil não encontrado.");

    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .insert({
        profile_id: profile.id,
        category: data.category,
        subject: data.subject,
        status: "open",
        ...(data.orderId ? { order_id: data.orderId } : {}),
      })
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao abrir o chamado: ${error.message}`);

    const { error: messageError } = await context.supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      author_profile_id: profile.id,
      body: data.message,
    });

    if (messageError) {
      throw new Error(`Chamado criado, mas a mensagem falhou: ${messageError.message}`);
    }

    return ticket;
  });

export const replyToTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ticketId: z.string().uuid(),
        body: z.string().trim().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<SupportMessage> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!profile) throw new Error("Perfil não encontrado.");

    // Proteção IDOR: Verificar se o ticket pertence ao usuário
    await requireOwnership(context.supabase, "support_tickets", data.ticketId, context.userId);

    // Add message

    const { data: row, error } = await context.supabase
      .from("support_messages")
      .insert({
        ticket_id: data.ticketId,
        author_profile_id: profile.id,
        body: data.body,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao responder: ${error.message}`);

    // Update ticket status to open if it was closed
    await context.supabase
      .from("support_tickets")
      .update({ status: "open", updated_at: new Date().toISOString() })
      .eq("id", data.ticketId)
      .eq("status", "closed");

    return row;
  });

export const closeTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOwnership(context.supabase, "support_tickets", data.id, context.userId);
    const { error } = await context.supabase

      .from("support_tickets")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) throw new Error(`Falha ao fechar o chamado: ${error.message}`);
    return { success: true };
  });

export const reopenTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOwnership(context.supabase, "support_tickets", data.id, context.userId);
    const { error } = await context.supabase

      .from("support_tickets")
      .update({ status: "open", updated_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) throw new Error(`Falha ao reabrir o chamado: ${error.message}`);
    return { success: true };
  });
