import { z } from "zod";

/**
 * AvanceBridge API Contract v1.0.0
 * Standard schemas and types for plugin communication.
 */

export const PluginActionSchema = z.enum([
  "heartbeat",
  "get_deliveries",
  "confirm_delivery",
  "fail_delivery",
  "link_account",
  "update_server_status",
  "healthcheck"
]);

export type PluginAction = z.infer<typeof PluginActionSchema>;

export const BaseRequestSchema = z.object({
  action: PluginActionSchema,
  server_id: z.string(),
  request_id: z.string().uuid().optional(),
});

export const HeartbeatSchema = BaseRequestSchema.extend({
  action: z.literal("heartbeat"),
  online_players: z.number().min(0),
  max_players: z.number().min(0),
  tps: z.number(),
});

export const GetDeliveriesSchema = BaseRequestSchema.extend({
  action: z.literal("get_deliveries"),
  limit: z.number().min(1).max(100).default(50),
});

export const ConfirmDeliverySchema = BaseRequestSchema.extend({
  action: z.literal("confirm_delivery"),
  delivery_id: z.string().uuid(),
});

export const FailDeliverySchema = BaseRequestSchema.extend({
  action: z.literal("fail_delivery"),
  delivery_id: z.string().uuid(),
  error: z.string(),
  backoff: z.boolean().default(true),
});

export const LinkAccountSchema = BaseRequestSchema.extend({
  action: z.literal("link_account"),
  minecraft_uuid: z.string(),
  minecraft_username: z.string(),
  verification_code: z.string().length(6),
});

export const PluginRequestSchema = z.discriminatedUnion("action", [
  HeartbeatSchema,
  GetDeliveriesSchema,
  ConfirmDeliverySchema,
  FailDeliverySchema,
  LinkAccountSchema,
]);

export type PluginRequest = z.infer<typeof PluginRequestSchema>;

export interface PluginResponse<T = any> {
  success: boolean;
  request_id: string;
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
