import { getEnv } from "./env.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Feature Flags do Habblet Mine
 * Gerencia o comportamento do sistema baseado no banco de dados com cache em memória.
 */

export const DEFAULT_FLAGS = {
  STORE_ENABLED: true,
  REAL_PAYMENTS_ENABLED: false,
  PLUGIN_DELIVERY_ENABLED: true,
  REGISTRATION_ENABLED: true,
  MAINTENANCE_MODE: false,
  DEMO_RANKINGS_ENABLED: true,
  SUPPORT_ENABLED: true,
  DISCORD_LOGIN_ENABLED: false,
  GOOGLE_LOGIN_ENABLED: true,
} as const;

export type FeatureFlag = keyof typeof DEFAULT_FLAGS;

// Cache interno no servidor (Stale-while-revalidate pattern)
let flagCache: {
  data: Partial<Record<FeatureFlag, boolean>> | null;
  lastFetch: number;
} = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 30000; // 30 segundos

/**
 * Busca as flags do banco com estratégia de cache.
 */
export async function getPublicFeatureFlags(forceRefresh = false): Promise<Partial<Record<FeatureFlag, boolean>>> {
  const now = Date.now();
  
  // Se tiver cache válido, retorna imediatamente
  if (!forceRefresh && flagCache.data && (now - flagCache.lastFetch < CACHE_TTL)) {
    return flagCache.data;
  }


  try {
    const env = getEnv();
    const { data, error } = await supabaseAdmin
      .from("feature_flags")
      .select("key, value")
      .eq("environment", env.APP_ENV);

    if (error) throw error;

    const dbFlags: Partial<Record<FeatureFlag, boolean>> = {};
    data.forEach((row: any) => {
      dbFlags[row.key as FeatureFlag] = row.value;
    });

    // Merge com os defaults para chaves que não existem no banco
    const finalFlags = { ...DEFAULT_FLAGS, ...dbFlags };
    
    flagCache = {
      data: finalFlags,
      lastFetch: now,
    };

    return finalFlags;
  } catch (err) {
    console.error("Erro ao carregar Feature Flags do banco, usando defaults:", err);
    return flagCache.data || DEFAULT_FLAGS;
  }
}

/**
 * Verifica se uma funcionalidade está ativa.
 */
export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  const flags = await getPublicFeatureFlags();
  return !!flags[flag];
}

/**
 * Lança um erro se a funcionalidade estiver desativada.
 */
export async function requireFeature(flag: FeatureFlag) {
  if (!(await isFeatureEnabled(flag))) {
    throw new Error(`Funcionalidade temporariamente indisponível: ${flag}`);
  }
}

export const getServerFlags = async () => getPublicFeatureFlags();
