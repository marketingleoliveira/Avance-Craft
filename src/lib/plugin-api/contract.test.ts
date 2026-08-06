import { computePluginSignature } from '../plugin-auth/hmac.server';
import { expect, test, describe } from 'vitest';

/**
 * AvanceBridge Cross-Language Test Vectors
 * 
 * These constants serve as the "ground truth" for both TypeScript 
 * and Java implementation tests. 
 */
export const VECTORS = [
  {
    name: "Heartbeat Simple",
    secret: "avance_test_secret_32_chars_long!!",
    timestamp: "1722977760",
    nonce: "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
    body: '{"action":"heartbeat","server_id":"habblet-survival-01","online_players":42,"max_players":100,"tps":19.95}',
    // Expected signature (hex)
    expected: "3ae78a4b74356c2218914c00975dbe92cbc25485bd681df1eeddd321822e1d1c"
  },
  {
    name: "Link Account (UTF-8 Characters)",
    secret: "another_secret_key_123456789012",
    timestamp: "1722978000",
    nonce: "7d9e8f7a-6b5c-4d3e-2f1a-0e9d8c7b6a5a",
    body: '{"action":"link_account","server_id":"avance-01","minecraft_uuid":"uuid","minecraft_username":"Jogador-Açúcar","verification_code":"XYZ123"}',
    // Expected signature (hex)
    expected: "57b0aaea3c70d8b60406ec2f920d5c4588747fb1ae14103d5135a5f2b23035a9"
  }
];

describe('AvanceBridge HMAC Test Vectors', () => {
  VECTORS.forEach(v => {
    test(`Vector: ${v.name}`, () => {
      const signature = computePluginSignature(v.timestamp, v.nonce, v.body, v.secret);
      expect(signature).toBe(v.expected);
    });
  });
});
