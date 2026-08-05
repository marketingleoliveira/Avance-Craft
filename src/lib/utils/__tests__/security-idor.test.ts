import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireOwnership } from '../security';

// Mock do Supabase
const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe('IDOR Protection (requireOwnership)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve permitir acesso se o usuário for o dono do recurso', async () => {
    const userId = 'user-123';
    const resourceId = 'res-456';
    const mockResource = { id: resourceId, profile_id: userId, data: 'secure' };

    // Simular que não é admin
    mockSupabase.rpc.mockResolvedValue({ data: false, error: null });
    
    // Simular busca bem sucedida com filtro de ownership
    mockSupabase.single.mockResolvedValue({ data: mockResource, error: null });

    const result = await requireOwnership(mockSupabase as any, 'orders', resourceId, userId);

    expect(result).toEqual(mockResource);
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', resourceId);
    expect(mockSupabase.eq).toHaveBeenCalledWith('profile_id', userId);
  });

  it('deve permitir acesso se o usuário for admin, mesmo não sendo dono', async () => {
    const userId = 'admin-123';
    const resourceId = 'res-456';
    const mockResource = { id: resourceId, profile_id: 'other-user', data: 'secure' };

    // Simular que é admin
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null });
    
    // Simular busca bem sucedida (sem filtro de ownership para admin)
    mockSupabase.single.mockResolvedValue({ data: mockResource, error: null });

    const result = await requireOwnership(mockSupabase as any, 'orders', resourceId, userId);

    expect(result).toEqual(mockResource);
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', resourceId);
    // Não deve ter filtrado por profile_id pois é admin
    expect(mockSupabase.eq).not.toHaveBeenCalledWith('profile_id', userId);
  });

  it('deve lançar erro se o recurso não pertencer ao usuário e ele não for admin', async () => {
    const userId = 'hacker-123';
    const resourceId = 'victim-res-456';

    // Simular que não é admin
    mockSupabase.rpc.mockResolvedValue({ data: false, error: null });
    
    // Simular que a busca falhou (Supabase retorna erro ou nulo quando eq(profile_id) não bate)
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    await expect(requireOwnership(mockSupabase as any, 'orders', resourceId, userId))
      .rejects.toThrow('Acesso negado');
  });
});
