import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "@/lib/utils/security";

/**
 * Funções administrativas para gerenciamento e visualização de logs.
 */

export const getErrorLogs = createServerFn({ method: "GET" })
  .input(z.object({
    severity: z.string().optional(),
    service: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(50)
  }))
  .handler(async ({ data }) => {
    await requireAdmin();

    let query = supabaseAdmin
      .from('error_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (data.severity) {
      query = query.eq('severity', data.severity);
    }

    if (data.service) {
      query = query.eq('service', data.service);
    }

    if (data.search) {
      query = query.ilike('message', `%${data.search}%`);
    }

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    const { data: logs, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    return { logs, count };
  });

export const pruneLogs = createServerFn({ method: "POST" })
  .input(z.object({ days: z.number().default(30) }))
  .handler(async ({ data }) => {
    await requireAdmin();

    const { error } = await supabaseAdmin.rpc('prune_old_logs', {
      retention_days: data.days
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });
