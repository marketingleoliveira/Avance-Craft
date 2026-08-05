/**
 * Cliente Supabase server-side com a chave publicável (anon).
 *
 * Usado apenas para leituras públicas durante SSR (catálogo ativo, notícias
 * publicadas, rankings, status). Respeita RLS como `anon` — nunca substitui o
 * cliente autenticado nem o cliente de service role.
 *
 * Este arquivo termina em `.server.ts`: o bundler impede que ele chegue ao
 * navegador. Importe-o somente dentro de handlers de server functions.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let cached: SupabaseClient<Database> | undefined;

export function getPublicServerClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    throw new Error(
      "Variáveis do backend ausentes: SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  cached = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      // Chaves `sb_` são opacas (não são JWT): enviar apenas o header apikey.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  return cached;
}
