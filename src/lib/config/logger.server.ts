import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getEnv } from "./env.server";

/**
 * Logger Centralizado Enterprise para o Habblet Mine.
 * Garante que erros não sejam silenciosos e mantém trilha de auditoria.
 */

type LogSeverity = 'info' | 'warn' | 'error' | 'critical' | 'audit';

interface LogOptions {
  module?: string;
  action?: string;
  context?: Record<string, any>;
  userId?: string;
  orderId?: string;
  paymentId?: string;
  pluginId?: string;
  stack?: string;
}

// Lista negra de campos sensíveis que nunca devem ser logados
const SENSITIVE_FIELDS = [
  'token', 'secret', 'password', 'senha', 'hmac', 'access_token', 
  'client_secret', 'key', 'cvv', 'card_number'
];

/**
 * Sanitiza objetos para remover informações sensíveis antes de logar.
 */
function sanitize(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in (sanitized as any)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      (sanitized as any)[key] = '[REDACTED]';
    } else if (typeof (sanitized as any)[key] === 'object') {
      (sanitized as any)[key] = sanitize((sanitized as any)[key]);
    }
  }
  
  return sanitized;
}

async function persistLog(
  severity: LogSeverity,
  service: string,
  message: string,
  options: LogOptions = {}
) {
  const env = getEnv();
  
  if (env.APP_ENV === 'development') {
    const consoleMethod = severity === 'error' || severity === 'critical' ? 'error' : 
                         severity === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${severity.toUpperCase()}] [${service}] ${message}`, options.context || '');
  }

  try {
    // Usamos null explicitamente onde o Supabase espera null em vez de undefined
    // e tratamos os tipos para bater com o gerado pelo Supabase
    const { error } = await supabaseAdmin.from('error_logs').insert({
      severity: severity as any,
      environment: env.APP_ENV,
      service,
      module: options.module ?? null,
      action: options.action ?? null,
      message: message.substring(0, 2000),
      stack: options.stack ?? null,
      context: sanitize(options.context || {}) as any,
      user_id: options.userId ?? null,
      order_id: options.orderId ?? null,
      payment_id: options.paymentId ?? null,
      plugin_id: options.pluginId ?? null
    });

    if (error) {
      console.error('FALHA CRÍTICA NO LOGGER:', error);
    }
  } catch (err) {
    console.error('ERRO AO PERSISTIR LOG NO BANCO:', err);
  }
}

export const logger = {
  info: (service: string, message: string, options?: LogOptions) => 
    persistLog('info', service, message, options),
    
  warn: (service: string, message: string, options?: LogOptions) => 
    persistLog('warn', service, message, options),
    
  error: (service: string, message: string, error?: any, options?: LogOptions) => 
    persistLog('error', service, message, {
      ...options,
      stack: error instanceof Error ? error.stack : (typeof error === 'string' ? error : undefined),
      context: { ...options?.context, error_detail: error?.message || error }
    }),
    
  critical: (service: string, message: string, error?: any, options?: LogOptions) => 
    persistLog('critical', service, message, {
      ...options,
      stack: error instanceof Error ? error.stack : (typeof error === 'string' ? error : undefined),
      context: { ...options?.context, error_detail: error?.message || error }
    }),
    
  audit: (service: string, action: string, message: string, options?: LogOptions) => 
    persistLog('audit', service, message, { ...options, action })
};
