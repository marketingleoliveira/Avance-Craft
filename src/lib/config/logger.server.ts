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
  
  for (const key in sanitized) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
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
  
  // No desenvolvimento, também logamos no console para facilidade
  if (env.APP_ENV === 'development') {
    const consoleMethod = severity === 'error' || severity === 'critical' ? 'error' : 
                         severity === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${severity.toUpperCase()}] [${service}] ${message}`, options.context || '');
  }

  try {
    const { error } = await supabaseAdmin.from('error_logs').insert({
      severity,
      environment: env.APP_ENV,
      service,
      module: options.module,
      action: options.action,
      message: message.substring(0, 2000), // Limitar tamanho da mensagem
      stack: options.stack,
      context: sanitize(options.context || {}),
      user_id: options.userId,
      order_id: options.orderId,
      payment_id: options.paymentId,
      plugin_id: options.pluginId
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
      stack: error instanceof Error ? error.stack : undefined,
      context: { ...options?.context, error_detail: error?.message || error }
    }),
    
  critical: (service: string, message: string, error?: any, options?: LogOptions) => 
    persistLog('critical', service, message, {
      ...options,
      stack: error instanceof Error ? error.stack : undefined,
      context: { ...options?.context, error_detail: error?.message || error }
    }),
    
  audit: (service: string, action: string, message: string, options?: LogOptions) => 
    persistLog('audit', service, message, { ...options, action })
};
