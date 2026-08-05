import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Utilitário para proteção contra IDOR (Insecure Direct Object Reference).
 * Garante que o recurso pertence ao usuário autenticado ou que o usuário tem privilégios de admin.
 * 
 * @param supabase Cliente Supabase (deve estar autenticado)
 * @param table Nome da tabela
 * @param id ID do recurso
 * @param userId ID do usuário autenticado
 * @param ownerColumn Nome da coluna que identifica o dono (default: 'profile_id')
 * @returns O recurso se o usuário for o dono ou admin
 */
export async function requireOwnership<T = any>(
  supabase: SupabaseClient,
  table: string,
  id: string,
  userId: string,
  ownerColumn: string = "profile_id"
): Promise<T> {
  // 1. Verificar se é admin primeiro (admins ignoram ownership)
  const { data: roleData } = await supabase.rpc('has_role', { 
    _user_id: userId, 
    _role: 'admin' 
  });
  
  const isAdmin = !!roleData;

  // 2. Tentar buscar o recurso filtrando por ID e Dono (se não for admin)
  let query = supabase.from(table).select("*").eq("id", id);
  
  if (!isAdmin) {
    query = query.eq(ownerColumn, userId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    console.error(`[IDOR PROTECT] Acesso negado para usuário ${userId} na tabela ${table} id ${id}`);
    throw new Error("Acesso negado: Recurso não encontrado ou você não tem permissão.");
  }

  return data as T;
}
