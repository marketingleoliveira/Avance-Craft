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
    // safeCompareSignatures expects HEX strings.
    // "aa" is not a valid hex length (must be multiple of 2 if treated as bytes, 
    // but the function uses Buffer.from(received, "hex") which might handle it 
    // differently or the test logic is slightly flawed in how it passes raw strings)
    
    // Valid hex strings of different lengths
    expect(safeCompareSignatures("aa11", "aa11bb")).toBe(false);
    expect(safeCompareSignatures("6161", "61616161")).toBe(false);
  });
});
