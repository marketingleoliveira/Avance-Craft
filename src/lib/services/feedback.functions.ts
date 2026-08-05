import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { Database } from "@/integrations/supabase/types";

export type FeedbackType = Database['public']['Enums']['feedback_type'];
export type FeedbackStatus = Database['public']['Enums']['feedback_status'];
export type FeedbackSeverity = Database['public']['Enums']['feedback_severity'];

const feedbackSchema = z.object({
  type: z.enum(['bug', 'suggestion', 'economy', 'performance', 'bedrock', 'java', 'interface', 'shop', 'delivery', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  steps_to_reproduce: z.string().optional(),
  expected_result: z.string().optional(),
  actual_result: z.string().optional(),
  minecraft_nickname: z.string().min(3),
  edition: z.enum(['java', 'bedrock']).optional(),
  version: z.string().optional(),
  device_info: z.string().optional(),
  server_id: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  contact_consent: z.boolean().default(false),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .validator((data: unknown) => feedbackSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { error } = await supabase
      .from('beta_feedback')
      .insert({
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        steps_to_reproduce: data.steps_to_reproduce ?? null,
        expected_result: data.expected_result ?? null,
        actual_result: data.actual_result ?? null,
        minecraft_nickname: data.minecraft_nickname,
        edition: data.edition ?? null,
        version: data.version ?? null,
        device_info: data.device_info ?? null,
        server_id: data.server_id ?? null,
        attachments: data.attachments ?? null,
        contact_consent: data.contact_consent,
        profile_id: session.user.id,
        status: 'new'
      });

    if (error) throw error;
    return { success: true };
  });

export const getMyFeedbacks = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('beta_feedback')
      .select('*')
      .eq('profile_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

export const getFeedbackDetails = createServerFn({ method: "GET" })
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('beta_feedback')
      .select('*, beta_feedback_comments(*, profiles(username, avatar_url))')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    const isAdmin = session.user.app_metadata?.['role'] === 'admin';
    if (data.profile_id !== session.user.id && !isAdmin) {
      throw new Error("Forbidden");
    }

    return data as any;
  });

export const getAdminFeedbacks = createServerFn({ method: "GET" })
  .validator((filters: unknown) => z.object({
    status: z.string().optional(),
    type: z.string().optional(),
    severity: z.string().optional(),
  }).optional().parse(filters))
  .handler(async ({ data: filters }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    let query = supabase
      .from('beta_feedback')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status as any);
    if (filters?.type) query = query.eq('type', filters.type as any);
    if (filters?.severity) query = query.eq('severity', filters.severity as any);

    const { data, error } = await query;
    if (error) throw error;
    return data as any[];
  });

export const updateFeedbackStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    id: z.string(),
    status: z.enum(['new', 'triaged', 'confirmed', 'in_progress', 'resolved', 'rejected', 'duplicate']),
    internal_notes: z.string().optional(),
    assigned_to: z.string().uuid().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from('beta_feedback')
      .update({
        status: data.status,
        internal_notes: data.internal_notes ?? null,
        assigned_to: data.assigned_to ?? null,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

    if (error) throw error;
    return { success: true };
  });
