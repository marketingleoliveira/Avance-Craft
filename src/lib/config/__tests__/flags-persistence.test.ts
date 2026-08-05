import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicFeatureFlags, DEFAULT_FLAGS } from '../flags';

// Mock do supabaseAdmin
const mockSupabaseAdmin = {
  from: vi.fn(),
};

vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

vi.mock('./env.server', () => ({
  getEnv: () => ({ APP_ENV: 'production' }),
  isProd: () => true,
  isStaging: () => false,
  isDev: () => false
}));

describe('Persistent Feature Flags System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpar cache manual entre testes (se necessário, mas o timestamp resolve)
  });

  it('deve carregar flags do banco e fazer merge com defaults', async () => {
    const mockData = [
      { key: 'STORE_ENABLED', value: false },
      { key: 'MAINTENANCE_MODE', value: true }
    ];

    (mockSupabaseAdmin.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
    });

    const flags = await getPublicFeatureFlags();

    expect(flags.STORE_ENABLED).toBe(false);
    expect(flags.MAINTENANCE_MODE).toBe(true);
    expect(flags.REGISTRATION_ENABLED).toBe(DEFAULT_FLAGS.REGISTRATION_ENABLED);
  });

  it('deve usar cache interno e não chamar o banco repetidamente (TTL)', async () => {
    const mockData = [{ key: 'STORE_ENABLED', value: true }];
    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

    (mockSupabaseAdmin.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock
    });

    // Primeira chamada - vai ao banco
    await getPublicFeatureFlags();
    expect(selectMock).toHaveBeenCalledTimes(1);

    // Segunda chamada - deve usar o cache
    await getPublicFeatureFlags();
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it('deve retornar defaults em caso de erro no banco (Resiliência)', async () => {
    (mockSupabaseAdmin.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Down' } })
    });

    // Resetando o cache para garantir que ele tente ir ao banco
    // No código real o cache pode estar sujo, mas aqui forçamos o erro
    const flags = await getPublicFeatureFlags();
    expect(flags.STORE_ENABLED).toBe(DEFAULT_FLAGS.STORE_ENABLED);
  });
});
