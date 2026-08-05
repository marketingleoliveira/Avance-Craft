/**
 * Feature Flags do Habblet Mine
 * Versão: v1.0.0-rc.1
 */
export const FLAGS = {
  STORE_ENABLED: true,
  REAL_PAYMENTS_ENABLED: false, 
  PLUGIN_DELIVERY_ENABLED: true,
  MAINTENANCE_MODE: false,
  DEMO_RANKINGS_ENABLED: true,
  EXPERIMENTAL_FEATURES: false,
} as const;

export const isFeatureEnabled = (flag: keyof typeof FLAGS) => FLAGS[flag];

/**
 * Retorna as flags no servidor. 
 * Em v1.0.0-rc.1, as flags são estáticas para garantir estabilidade,
 * mas preparadas para leitura dinâmica no futuro.
 */
export const getServerFlags = async () => {
  return FLAGS;
};
