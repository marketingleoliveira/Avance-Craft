import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Funções administrativas para gerenciamento e visualização de logs.
 * Nota: Como requireOwnership em security.ts espera parâmetros específicos para tabelas com dono,
 * implementamos a validação de admin diretamente aqui para simplificar o log de sistema.
 */

async function validateAdmin(userId: string) {
  const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { 
    _user_id: userId, 
    _role: 'admin' 
  });
  if (!isAdmin) {
    throw new Error("Acesso negado: Somente administradores podem acessar logs do sistema.");
  }
}

export const getErrorLogs = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    severity: z.string().optional(),
    service: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(50)
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Validar se o usuário autenticado é admin
    const session = await (context as any).supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) throw new Error("Não autenticado");
    await validateAdmin(userId);

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

    return { logs: logs || [], count: count || 0 };
  });

export const pruneLogs = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ days: z.number().default(30) }).parse(data))
  .handler(async ({ data, context }) => {
    const session = await (context as any).supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) throw new Error("Não autenticado");
    await validateAdmin(userId);

    const { error } = await supabaseAdmin.rpc('prune_old_logs', {
      retention_days: data.days
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });
