import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateMinecraftNickname } from '../minecraft-validator.server';

describe('Minecraft Nickname Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve validar um nick Java válido via API Mojang', async () => {
    // Mock fetch global
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'uuid-123', name: 'PlayerOne' })
    });

    const result = await validateMinecraftNickname('PlayerOne', 'java');
    expect(result.valid).toBe(true);
    expect(result.uuid).toBe('uuid-123');
    expect(result.source).toBe('mojang');
  });

  it('deve rejeitar nick Java inexistente na Mojang', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204 // No content = not found
    });

    const result = await validateMinecraftNickname('Inexistente', 'java');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('não encontrado');
  });

  it('deve rejeitar nick Java com formato inválido sem chamar API', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await validateMinecraftNickname('Ab', 'java'); // muito curto
    
    expect(result.valid).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('deve validar nick Bedrock baseado em formato', async () => {
    const result = await validateMinecraftNickname('Player Bedrock', 'bedrock');
    expect(result.valid).toBe(true);
    expect(result.source).toBe('format');
  });

  it('deve usar cache para chamadas subsequentes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'uuid-cached', name: 'CachedPlayer' })
    });

    // Primeira chamada
    await validateMinecraftNickname('CachedPlayer', 'java');
    
    // Segunda chamada
    const result = await validateMinecraftNickname('CachedPlayer', 'java');
    expect(result.source).toBe('cache');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
