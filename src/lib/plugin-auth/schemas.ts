import { z } from "zod";

export const getDeliveriesSchema = z.object({
  action: z.literal("get_deliveries"),
  server_id: z.string(),
  plugin_instance_id: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(10),
});

export const confirmDeliverySchema = z.object({
  action: z.literal("confirm_delivery"),
  server_id: z.string(),
  delivery_id: z.string().uuid(),
  idempotency_key: z.string(),
  execution_result: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),
});

export const failDeliverySchema = z.object({
  action: z.literal("fail_delivery"),
  server_id: z.string(),
  delivery_id: z.string().uuid(),
  idempotency_key: z.string(),
  error_code: z.string(),
  error_message: z.string(),
  retryable: z.boolean().default(true),
});

export const heartbeatSchema = z.object({
  action: z.literal("heartbeat"),
  server_id: z.string(),
  plugin_instance_id: z.string().uuid(),
  plugin_version: z.string().optional(),
  minecraft_version: z.string().optional(),
  paper_version: z.string().optional(),
  online_players: z.number().int().nonnegative().optional(),
  max_players: z.number().int().nonnegative().optional(),
  tps: z.number().optional(),
  memory_used_mb: z.number().optional(),
  memory_max_mb: z.number().optional(),
  uptime_seconds: z.number().int().nonnegative().optional(),
});

export const updateServerStatusSchema = z.object({
  action: z.literal("update_server_status"),
  server_id: z.string(),
  online: z.boolean(),
  players_online: z.number().int().nonnegative(),
  max_players: z.number().int().nonnegative(),
  version: z.string().optional(),
  ip: z.string().optional(),
});

export const healthcheckSchema = z.object({
  action: z.literal("healthcheck"),
  server_id: z.string(),
});

export const pluginActionSchema = z.discriminatedUnion("action", [
  getDeliveriesSchema,
  confirmDeliverySchema,
  failDeliverySchema,
  heartbeatSchema,
  updateServerStatusSchema,
  healthcheckSchema,
]);

export type PluginAction = z.infer<typeof pluginActionSchema>;
