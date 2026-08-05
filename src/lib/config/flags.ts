/**
 * Feature Flags do Habblet Mine
 * Versão: v1.0.0-rc.1
 */
export const FLAGS = {
  STORE_ENABLED: true,
  REAL_PAYMENTS_ENABLED: false, // Forçado falso para segurança inicial, mudar via env em prod se necessário
  PLUGIN_DELIVERY_ENABLED: true,
  MAINTENANCE_MODE: false,
  DEMO_RANKINGS_ENABLED: true,
  EXPERIMENTAL_FEATURES: false, // Bloqueio de funcionalidades experimentais em produção
} as const;

export const isFeatureEnabled = (flag: keyof typeof FLAGS) => FLAGS[flag];
