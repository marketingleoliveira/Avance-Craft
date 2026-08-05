import { supabaseAdmin } from "@/integrations/supabase/client.server";

type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogContext {
  correlationId?: string;
  userId?: string;
  orderId?: string;
  paymentId?: string;
  deliveryId?: string;
  pluginId?: string;
  metadata?: Record<string, any>;
}

export async function logEvent(
  level: LogLevel,
  event: string,
  message: string,
  context: LogContext = {}
) {
  const timestamp = new Date().toISOString();
  
  // Sanitize message - ensure no secrets are logged if they accidentally leak into the message string
  const sanitizedMessage = message.replace(/(token|password|secret|key|auth|signature)=[^& ]+/gi, '$1=[REDACTED]');

  // In a real environment, this would go to a logging service or a dedicated DB table
  // For Habblet Mine, we use audit_logs table for traceability
  try {
      .from('audit_logs')
      .insert({
        action: `[${level.toUpperCase()}] ${event}`,
        entity: context.orderId ? 'order' : context.userId ? 'user' : 'system',
        entity_id: context.orderId || context.userId || context.paymentId || 'system',
        actor_profile_id: context.userId || null,
        metadata: {
          timestamp,
          level,
          message: sanitizedMessage,
          correlation_id: context.correlationId,
          payment_id: context.paymentId,
          delivery_id: context.deliveryId,
          plugin_id: context.pluginId,
          ...context.metadata
        }
      });

    if (error) console.error('Failed to write audit log:', error);
  } catch (err) {
    console.error('Logger error:', err);
  }

  // Also log to console for development visibility
  const consolePrefix = `[${timestamp}] [${level.toUpperCase()}] [${context.correlationId || 'no-id'}] `;
  if (level === 'error') {
    console.error(consolePrefix + sanitizedMessage, context);
  } else if (level === 'warn') {
    console.warn(consolePrefix + sanitizedMessage, context);
  } else {
    console.log(consolePrefix + sanitizedMessage, context);
  }
}
