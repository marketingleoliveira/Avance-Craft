/**
 * Suporte: tickets e mensagens do próprio jogador (staff enxerga tudo via RLS).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupportMessage, SupportTicket } from "@/lib/types/database";

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SupportTicket[]> => {
    const { data, error } = await context.supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(`Falha ao carregar os chamados: ${error.message}`);
    return data ?? [];
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
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
        subject: data.subject,
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

export const listTicketMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ ticketId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<SupportMessage[]> => {
    const { data: rows, error } = await context.supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Falha ao carregar as mensagens: ${error.message}`);
    return rows ?? [];
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
    return row;
  });
