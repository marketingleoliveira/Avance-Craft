import { z } from "zod";
import { PluginRequestSchema, PluginResponse } from "./schemas";

/**
 * AvanceBridge Technical Contract v1.0.0
 * 
 * Constants and versioning for the plugin API.
 */

export const API_VERSION = "1.0.0";
export const AUTH_HEADER_ID = "X-Plugin-Id";
export const AUTH_HEADER_TIMESTAMP = "X-Timestamp";
export const AUTH_HEADER_NONCE = "X-Nonce";
export const AUTH_HEADER_SIGNATURE = "X-Signature";

export const MAX_BODY_SIZE = 64 * 1024; // 64KB (PLUGIN_MAX_BODY_BYTES)
export const TIMESTAMP_WINDOW_SECONDS = 60; // 60s (PLUGIN_HMAC_WINDOW_SECONDS)
export const RATE_LIMIT_PER_MINUTE = 120; // 120 (PLUGIN_RATE_LIMIT_PER_MINUTE)
export const RESERVATION_SECONDS = 60; // 60s (PLUGIN_RESERVATION_SECONDS)
export const DEFAULT_MAX_ATTEMPTS = 5; // 5 (PLUGIN_DEFAULT_MAX_ATTEMPTS)
export const DEFAULT_BATCH_SIZE = 10; // 10 (PLUGIN_DEFAULT_BATCH_SIZE)

/**
 * Standard Error Codes
 */
export const ERROR_CODES = {
  INVALID_SIGNATURE: "AUTH_001",
  TIMESTAMP_OUT_OF_WINDOW: "AUTH_002",
  NONCE_ALREADY_USED: "AUTH_003",
  RATE_LIMIT_EXCEEDED: "AUTH_004",
  INVALID_PAYLOAD: "DATA_001",
  SERVER_NOT_FOUND: "DATA_002",
  INTERNAL_ERROR: "SYS_001",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Helper to build a success response
 */
export function buildPluginSuccess<T>(requestId: string, data: T): PluginResponse<T> {
  return {
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data
  };
}

/**
 * Helper to build an error response
 */
export function buildPluginError(requestId: string, code: ErrorCode, message: string): PluginResponse {
  return {
    success: false,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    error: { code, message }
  };
}
