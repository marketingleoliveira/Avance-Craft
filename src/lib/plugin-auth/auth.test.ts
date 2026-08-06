import { describe, it, expect, vi, beforeEach } from "vitest";
import { computePluginSignature, safeCompareSignatures } from "./hmac.server";
import { verifyPluginRequest } from "./verify-plugin-request.server";

describe("Plugin HMAC Auth", () => {
  const secret = "test-secret-32-chars-long-minimal";
  const pluginId = "test-server";

  it("should compute and validate correct signature", () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = "unique-nonce";
    const body = JSON.stringify({ action: "heartbeat" });
    
    const sig = computePluginSignature(timestamp, nonce, body, secret);
    expect(safeCompareSignatures(sig, sig)).toBe(true);
    
    const wrongSig = computePluginSignature(timestamp, nonce, body, "wrong-secret");
    expect(safeCompareSignatures(sig, wrongSig)).toBe(false);
  });

  it("should fail with modified body", () => {
    const timestamp = "1234567890";
    const nonce = "nonce1";
    const body = "original";
    const sig = computePluginSignature(timestamp, nonce, body, secret);
    
    const modifiedBody = "tampered";
    const expectedForTampered = computePluginSignature(timestamp, nonce, modifiedBody, secret);
    
    expect(safeCompareSignatures(sig, expectedForTampered)).toBe(false);
  });

  it("should handle constant time comparison with different lengths", () => {
    expect(safeCompareSignatures("aa", "aaa")).toBe(false);
    expect(safeCompareSignatures("6161", "616161")).toBe(false); // hex for 'aa' and 'aaa'
  });
});
