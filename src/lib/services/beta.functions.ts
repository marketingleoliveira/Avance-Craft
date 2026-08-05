import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

/**
 * Busca o status do participante no beta
 */
export const getBetaStatus = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('beta_participants')
      .select('*, beta_invites(campaign)')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  });

/**
 * Resgata um convite beta
 */
export const joinBeta = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ code: z.string().min(4) }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    if (!userId) throw new Error("Não autenticado");

    // Chamando a RPC que criamos na migration
    const { data: result, error } = await supabaseAdmin.rpc('use_beta_invite', {
      _code: data.code.toUpperCase().trim(),
      _profile_id: userId
    });

    if (error) throw error;
    
    const res = result as any;
    if (!res.success) {
      throw new Error(res.error || "Erro ao resgatar convite");
    }

    return { success: true };
  });

/**
 * (Admin) Lista convites
 */
export const adminListBetaInvites = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('beta_invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

/**
 * (Admin) Criar convite
 */
export const adminCreateBetaInvite = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    code: z.string().min(4),
    max_uses: z.number().min(1),
    campaign: z.string().optional(),
    expires_at: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    const { data: invite, error } = await supabaseAdmin
      .from('beta_invites')
      .insert({
        code: data.code.toUpperCase(),
        max_uses: data.max_uses,
        campaign: data.campaign,
        expires_at: data.expires_at,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return invite;
  });

/**
 * (Admin) Lista participantes
 */
export const adminListBetaParticipants = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('beta_participants')
      .select('*, profiles(minecraft_nickname), beta_invites(code, campaign)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

/**
 * (Admin) Atualizar status de participante
 */
export const adminUpdateParticipantStatus = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string(),
    status: z.enum(['invited', 'registered', 'approved', 'active', 'blocked'])
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    const updateData: any = { status: data.status, updated_at: new Date().toISOString() };
    
    if (data.status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = userId;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('beta_participants')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  });
