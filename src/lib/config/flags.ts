import { getEnv, isProd, isStaging } from "./env.server";

/**
 * Feature Flags do Habblet Mine
 * Gerencia o comportamento do sistema baseado no ambiente e configurações.
 */

export const FLAGS = {
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

export type FeatureFlag = keyof typeof FLAGS;

/**
 * Verifica se uma funcionalidade está ativa no servidor.
 * Pode ler de variáveis de ambiente para sobrescrever padrões.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const env = getEnv();
  
  // Sobrescritas via variável de ambiente (ex: VITE_FLAG_STORE_ENABLED)
  const envKey = `VITE_FLAG_${flag}`;
  if (process.env[envKey] !== undefined) {
    return process.env[envKey] === "true";
  }

  // Regras de negócio por ambiente
  if (isProd()) {
    if (flag === "DEMO_RANKINGS_ENABLED") return false;
    if (flag === "REAL_PAYMENTS_ENABLED") return process.env['REAL_PAYMENTS_ENABLED'] === "true";
  }

  if (isStaging()) {
    if (flag === "REAL_PAYMENTS_ENABLED") return false; // Staging sempre sandbox
  }

  return FLAGS[flag];
}

/**
 * Lança um erro se a funcionalidade estiver desativada.
 */
export function requireFeature(flag: FeatureFlag) {
  if (!isFeatureEnabled(flag)) {
    throw new Error(`Funcionalidade temporariamente indisponível: ${flag}`);
  }
}

/**
 * Retorna flags seguras para o frontend.
 */
export function getPublicFeatureFlags() {
  const publicFlags: Partial<Record<FeatureFlag, boolean>> = {};
  
  for (const flag of Object.keys(FLAGS) as FeatureFlag[]) {
    publicFlags[flag] = isFeatureEnabled(flag);
  }
  
  return publicFlags;
}

export const getServerFlags = async () => getPublicFeatureFlags();
