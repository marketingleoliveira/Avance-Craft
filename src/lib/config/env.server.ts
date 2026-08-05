import { z } from "zod";

/**
 * Esquema de validação para variáveis de ambiente do Avance.
 * Garante separação clara entre development, staging e production.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  APP_BASE_URL: z.string().url().default("http://localhost:8080"),
  
  // Mercado Pago
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  
  // Plugin Minecraft
  PLUGIN_ID: z.string().optional(),
  PLUGIN_SECRET_CURRENT: z.string().optional(),
  PLUGIN_SECRET_PREVIOUS: z.string().optional(), // Para rotação de chaves sem downtime
  
  // Segurança e Timeouts
  HMAC_CLOCK_TOLERANCE_SECONDS: z.coerce.number().default(300),
  HEARTBEAT_TIMEOUT_SECONDS: z.coerce.number().default(60),
  
  // Suporte e Logs
  SUPPORT_EMAIL: z.string().email().default("suporte@habblet.com.br"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (env) return env;
  
  // No Bun/Cloudflare Worker, process.env contém as variáveis injetadas
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Erro na configuração do ambiente:", JSON.stringify(result.error.format(), null, 2));
    
    // Em staging ou production, falhar imediatamente se houver erro de schema
    if (process.env['APP_ENV'] === "production" || process.env['APP_ENV'] === "staging") {
      throw new Error("Configuração de ambiente inválida para ambiente crítico. Verifique os logs.");
    }
    
    // Em dev, tenta carregar o que for possível
    env = envSchema.parse(process.env || {});
  } else {
    env = result.data;
  }
  
  return env;
}

export const isProd = () => getEnv().APP_ENV === "production";
export const isStaging = () => getEnv().APP_ENV === "staging";
export const isDev = () => getEnv().APP_ENV === "development";

/**
 * Validação rigorosa de inicialização.
 * Chamada no startup para impedir que o sistema suba incompleto em produção/staging.
 */
export function validateProductionConfig() {
  const currentEnv = getEnv();
  
  if (currentEnv.APP_ENV === "development") return;
  
  const criticalVars = [
    { key: "MERCADOPAGO_ACCESS_TOKEN", label: "Token do Mercado Pago" },
    { key: "MERCADOPAGO_WEBHOOK_SECRET", label: "Secret de Webhook do MP" },
    { key: "PLUGIN_ID", label: "ID do Servidor Minecraft" },
    { key: "PLUGIN_SECRET_CURRENT", label: "Chave HMAC Atual do Plugin" },
  ];
  
  const missing = criticalVars.filter(v => !process.env[v.key]);
  
  if (missing.length > 0) {
    const labels = missing.map(v => v.label).join(", ");
    throw new Error(`BLOQUEIO DE STARTUP: Variáveis críticas ausentes para ${currentEnv.APP_ENV}: ${labels}`);
  }

  // Garantia adicional: se for produção real, o e-mail de suporte não pode ser o padrão se solicitado
  if (currentEnv.APP_ENV === "production" && currentEnv.SUPPORT_EMAIL === "suporte@habblet.com.br" && process.env['FORCE_BRANDED_EMAIL'] === 'true') {
     throw new Error("BLOQUEIO: E-mail de suporte padrão detectado em produção.");
  }
}
