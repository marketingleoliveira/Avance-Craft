import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().url().default("http://localhost:8080"),
  
  // Mercado Pago
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  
  // Plugin Minecraft
  PLUGIN_SECRET_KEY: z.string().optional(),
  PLUGIN_ID: z.string().optional(),
  
  // Security
  HMAC_CLOCK_TOLERANCE_SECONDS: z.coerce.number().default(300),
  HEARTBEAT_TIMEOUT_SECONDS: z.coerce.number().default(60),
  
  // Database (managed by Lovable Cloud, but we might have custom settings)
  // VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are usually handled by the client
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (env) return env;
  
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    
    // In production, we want to fail fast if critical vars are missing
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration. Check logs for details.");
    }
    
    // In dev, we can continue with defaults
    env = envSchema.parse({});
  } else {
    env = result.data;
  }
  
  return env;
}

export const isProd = getEnv().NODE_ENV === "production";
export const isDev = getEnv().NODE_ENV === "development";
export const isTest = getEnv().NODE_ENV === "test";

/**
 * Validates the environment for production readiness.
 */
export function validateProductionConfig() {
  if (!isProd) return;
  
  const requiredVars = [
    "MERCADOPAGO_ACCESS_TOKEN",
    "MERCADOPAGO_WEBHOOK_SECRET",
    "PLUGIN_SECRET_KEY",
    "PLUGIN_ID",
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    throw new Error(`CRITICAL: Missing production environment variables: ${missing.join(", ")}`);
  }
}
