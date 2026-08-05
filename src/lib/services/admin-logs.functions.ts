import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireOwnership } from "@/lib/utils/security";

/**
 * Funções administrativas para gerenciamento e visualização de logs.
 */

export const getErrorLogs = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    severity: z.string().optional(),
    service: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(50)
  }).parse(data))
  .handler(async ({ data }) => {
    // No Habblet Mine, requireOwnership sem resourceId valida apenas se é admin
    await requireOwnership('admin-logs');

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
  .validator((data: unknown) => z.object({ days: z.number().default(30) }).parse(data))
  .handler(async ({ data }) => {
    await requireOwnership('admin-logs');

    const { error } = await supabaseAdmin.rpc('prune_old_logs', {
      retention_days: data.days
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });
