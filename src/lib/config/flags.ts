import { getEnv, isProd, isStaging } from "./env.server";

/**
 * Feature Flags do Habblet Mine
 * Gerencia o comportamento do sistema baseado no ambiente.
 */

// Flags estáticas baseadas no ambiente
const getFlagsByEnv = () => {
  const env = getEnv();
  
  // Base padrão
  const baseFlags = {
    STORE_ENABLED: true,
    REAL_PAYMENTS_ENABLED: false,
    PLUGIN_DELIVERY_ENABLED: true,
    MAINTENANCE_MODE: false,
    DEMO_RANKINGS_ENABLED: true,
    EXPERIMENTAL_FEATURES: false,
    REGISTRATION_ENABLED: true,
  };

  if (isProd()) {
    return {
      ...baseFlags,
      REAL_PAYMENTS_ENABLED: process.env['REAL_PAYMENTS_ENABLED'] === 'true',
      DEMO_RANKINGS_ENABLED: false, // Nunca rankings demo em produção
      EXPERIMENTAL_FEATURES: false, // Bloqueio total de features instáveis
      MAINTENANCE_MODE: process.env['MAINTENANCE_MODE'] === 'true',
    };
  }

  if (isStaging()) {
    return {
      ...baseFlags,
      REAL_PAYMENTS_ENABLED: false, // Staging sempre usa sandbox/MP test
      DEMO_RANKINGS_ENABLED: true,
      EXPERIMENTAL_FEATURES: true,  // Permitido para testes
    };
  }

  // Development
  return {
    ...baseFlags,
    EXPERIMENTAL_FEATURES: true,
    DEMO_RANKINGS_ENABLED: true,
  };
};

export const FLAGS = getFlagsByEnv();

export const isFeatureEnabled = (flag: keyof typeof FLAGS) => FLAGS[flag];

/**
 * Retorna as flags no servidor.
 */
export const getServerFlags = async () => {
  return FLAGS;
};
