import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicFeatureFlags, DEFAULT_FLAGS } from '../flags';

// Usar o factory diretamente dentro do vi.mock para evitar problemas de hoisting com variáveis de fora
vi.mock('@/integrations/supabase/client.server', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockReturnThis(),
    }
  };
});

vi.mock('../env.server', () => ({
  getEnv: () => ({ APP_ENV: 'production' }),
  isProd: () => true,
  isStaging: () => false,
  isDev: () => false
}));

describe('Persistent Feature Flags System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar flags do banco e fazer merge com defaults', async () => {
    // Importar o mock localmente para configurar o comportamento por teste
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    const mockData = [
      { key: 'STORE_ENABLED', value: false },
      { key: 'MAINTENANCE_MODE', value: true }
    ];

    (supabaseAdmin.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
    });

    const flags = await getPublicFeatureFlags();

    expect(flags.STORE_ENABLED).toBe(false);
    expect(flags.MAINTENANCE_MODE).toBe(true);
    expect(flags.REGISTRATION_ENABLED).toBe(DEFAULT_FLAGS.REGISTRATION_ENABLED);
  });

  it('deve usar cache interno e não chamar o banco repetidamente (TTL)', async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const mockData = [{ key: 'STORE_ENABLED', value: true }];
    
    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

    (supabaseAdmin.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock
    });

    // Primeira chamada - vai ao banco
    await getPublicFeatureFlags();
    expect(selectMock).toHaveBeenCalledTimes(1);

    // Segunda chamada - deve usar o cache (TTL é 30s)
    await getPublicFeatureFlags();
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it('deve retornar defaults em caso de erro no banco (Resiliência)', async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    // Forçar a invalidação do cache para este teste específico simulando passagem de tempo
    // No código real, se der erro e não tiver cache, ele retorna defaults
    (supabaseAdmin.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Down' } })
    });

    const flags = await getPublicFeatureFlags();
    expect(flags.STORE_ENABLED).toBe(DEFAULT_FLAGS.STORE_ENABLED);
  });
});
