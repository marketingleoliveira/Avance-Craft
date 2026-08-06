import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

/**
 * Rate limit ultra simples baseado em memória (para o sandbox).
 * Em produção, usar Redis ou similar no Worker.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  serverId: string,
  ip: string,
  limit: number = 120,
  windowMs: number = 60000
): Promise<boolean> {
  const key = `rl:${serverId}:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
