import { createHmac, timingSafeEqual } from "crypto";

export function computePluginSignature(
  timestamp: string,
  nonce: string,
  rawBody: string,
  secret: string
): string {
  const data = `${timestamp}.${nonce}.${rawBody}`;
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function safeCompareSignatures(received: string, expected: string): boolean {
  try {
    const receivedBuffer = Buffer.from(received, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    
    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
