/**
 * Habblet Mine Feature Flags
 * 
 * Allows enabling/disabling features based on the environment or manual override.
 */

export interface FeatureFlags {
  STORE_ENABLED: boolean;
  REAL_PAYMENTS_ENABLED: boolean;
  PLUGIN_DELIVERY_ENABLED: boolean;
  REGISTRATION_ENABLED: boolean;
  MAINTENANCE_MODE: boolean;
  DEMO_RANKINGS_ENABLED: boolean;
  DETAILED_LOGS: boolean;
}

// In a real scenario, these could be fetched from a DB or Edge Config
export const getFeatureFlags = (env: string): FeatureFlags => {
  const isProd = env === "production";
  
  return {
    STORE_ENABLED: true,
    REAL_PAYMENTS_ENABLED: isProd, // Only real payments in production by default
    PLUGIN_DELIVERY_ENABLED: true,
    REGISTRATION_ENABLED: true,
    MAINTENANCE_MODE: false,
    DEMO_RANKINGS_ENABLED: !isProd, // Show demo rankings only in dev/staging
    DETAILED_LOGS: !isProd,        // No detailed logs in production
  };
};

/**
 * Helper to get flags on the server side
 */
export async function getServerFlags() {
  const { getEnv } = await import("./env.server");
  const env = getEnv();
  return getFeatureFlags(env.NODE_ENV);
}
