import { createServerFn } from "@tanstack/react-start";
import { validateProductionConfig, getEnv } from "./env.server";
import { getServerFlags } from "./flags";
import { logEvent } from "../utils/logger.server";

/**
 * Performs a production readiness check and returns the current system status.
 * This should be called during application startup or in critical loaders.
 */
export const checkSystemHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const env = getEnv();
      const flags = await getServerFlags();
      
      // 1. Production validation
      if (env.NODE_ENV === "production") {
        validateProductionConfig();
      }
      
      // 2. Log startup event
      await logEvent("info", "SYSTEM_STARTUP", "System health check performed", {
        metadata: {
          node_env: env.NODE_ENV,
          store_enabled: flags.STORE_ENABLED,
          real_payments: flags.REAL_PAYMENTS_ENABLED
        }
      });
      
      return {
        status: "healthy",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        flags
      };
    } catch (error: any) {
      await logEvent("error", "SYSTEM_HEALTH_FAILURE", error.message);
      
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  });
