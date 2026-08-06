export interface PluginAuthHeaders {
  pluginId: string;
  timestamp: string;
  nonce: string;
  signature: string;
}

export type PluginAuthErrorCode = 
  | 'invalid_request'
  | 'invalid_signature'
  | 'unknown_plugin'
  | 'plugin_disabled'
  | 'replay_detected'
  | 'expired_timestamp'
  | 'payload_too_large'
  | 'invalid_content_type';

export interface PluginAuthResult {
  valid: boolean;
  serverId?: string;
  errorCode?: PluginAuthErrorCode;
  status: number;
}
