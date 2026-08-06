import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/config/logger.server";

// Esquema de validação para o nick do Minecraft (padrão Mojang: 3-16 chars, alfanumérico + _)
const minecraftNickSchema = z.string()
  .min(3)
  .max(16)
  .regex(/^[a-zA-Z0-9_]+$/, "Nick inválido");

export interface BuildCommandParams {
  order_item: {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    player_name: string;
    player_uuid?: string;
  };
}

export interface ValidatedCommand {
  command: string;
  server_id: string;
  requires_online_player: boolean;
  delay_seconds: number;
  max_attempts: number;
}

/**
 * Serviço buildDeliveryCommands
 * Transforma templates de comandos em comandos reais validados e seguros.
 */
export async function buildDeliveryCommands(
  params: BuildCommandParams,
  supabase: SupabaseClient
): Promise<ValidatedCommand[]> {
  const { order_item } = params;

  // 1. Validar Nick
  const nickResult = minecraftNickSchema.safeParse(order_item.player_name);
  if (!nickResult.success) {
    throw new Error(`Segurança: Nick de jogador inválido detectado: ${order_item.player_name}`);
  }

  // 2. Buscar Templates e Allowlist em paralelo
  const [commandsRes, allowlistRes] = await Promise.all([
    supabase
      .from("product_commands")
      .select("*")
      .eq("product_id", order_item.product_id)
      .eq("enabled", true)
      .order("execution_order", { ascending: true }),
    supabase
      .from("command_allowlist")
      .select("prefix")
  ]);

  if (commandsRes.error) throw commandsRes.error;
  if (allowlistRes.error) throw allowlistRes.error;

  const templates = commandsRes.data || [];
  const allowedPrefixes = (allowlistRes.data || []).map(a => a.prefix);

  const validatedCommands: ValidatedCommand[] = [];

  for (const template of templates) {
    let finalCommand = template.command_template;

    // 3. Substituir Placeholders (somente os permitidos)
    finalCommand = finalCommand
      .replace(/{player}/g, order_item.player_name)
      .replace(/{player_uuid}/g, order_item.player_uuid || "")
      .replace(/{quantity}/g, order_item.quantity.toString())
      .replace(/{order_id}/g, order_item.order_id)
      .replace(/{product_id}/g, order_item.product_id);

    // 4. Validações de Segurança Críticas
    
    // R1: Rejeitar quebras de linha e caracteres de controle
    if (/[\r\n\x00-\x1F\x7F]/.test(finalCommand)) {
      await logSecurityIncident("Control characters detected", finalCommand, order_item.order_id);
      continue;
    }

    // R2: Rejeitar múltiplos comandos (ex: usando ;)
    if (finalCommand.includes(";")) {
      await logSecurityIncident("Multiple commands attempt (semicolon)", finalCommand, order_item.order_id);
      continue;
    }

    // R3: Rejeitar comandos vazios
    if (!finalCommand.trim()) continue;

    // R4: Rejeitar comprimento excessivo
    if (finalCommand.length > 512) {
      await logSecurityIncident("Command length limit exceeded", finalCommand, order_item.order_id);
      continue;
    }

    // R5: Rejeitar placeholders não substituídos (vazamento de template)
    const unknownPlaceholder = finalCommand.match(/{[a-zA-Z0-9_]+}/);
    if (unknownPlaceholder) {
      await logSecurityIncident(`Unsubstituted placeholder: ${unknownPlaceholder[0]}`, finalCommand, order_item.order_id);
      continue;
    }

    // R6: Validar contra Allowlist de Prefixos
    const isAllowed = allowedPrefixes.some(prefix => finalCommand.toLowerCase().startsWith(prefix.toLowerCase()));
    if (!isAllowed) {
      await logSecurityIncident("Command prefix not in allowlist", finalCommand, order_item.order_id);
      continue;
    }

    validatedCommands.push({
      command: finalCommand.trim(),
      server_id: template.server_id,
      requires_online_player: template.requires_online_player,
      delay_seconds: template.delivery_delay_seconds,
      max_attempts: template.maximum_attempts
    });
  }

  return validatedCommands;
}

async function logSecurityIncident(reason: string, command: string, orderId: string) {
  await logger.error("security-delivery", `Injeção de comando bloqueada: ${reason}`, {
    context: { command, orderId }
  });
}
