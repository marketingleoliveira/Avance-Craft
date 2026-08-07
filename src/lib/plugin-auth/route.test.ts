import { describe, it, expect } from "vitest";
import { computePluginSignature } from "./hmac.server";

describe("Plugin Route Integration Logic", () => {
  const secret = "test-secret-long-enough-for-hmac-32";
  
  it("should generate a valid signature for a get_deliveries request", () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    const body = JSON.stringify({
      action: "get_deliveries",
      server_id: "avance-survival-01",
      plugin_instance_id: crypto.randomUUID(),
      limit: 10
    });

    const signature = computePluginSignature(timestamp, nonce, body, secret);
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // SHA256 hex
  });

  it("should fail validation if body is tampered", () => {
    const timestamp = "1625097600";
    const nonce = "nonce-123";
    const body = '{"action":"heartbeat"}';
    const signature = computePluginSignature(timestamp, nonce, body, secret);

    const tamperedBody = '{"action":"heartbeat","extra":"data"}';
    const tamperedSignature = computePluginSignature(timestamp, nonce, tamperedBody, secret);
    
    expect(signature).not.toBe(tamperedSignature);
  });
});
