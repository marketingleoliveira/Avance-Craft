CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    environment TEXT NOT NULL DEFAULT 'production',
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (key, environment)
);

GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_read_all" ON public.feature_flags
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "feature_flags_admin_manage" ON public.feature_flags
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Popular com valores iniciais padrão
INSERT INTO public.feature_flags (key, value, description, environment) VALUES
('STORE_ENABLED', true, 'Habilita ou desabilita todo o sistema de compras do portal.', 'production'),
('REAL_PAYMENTS_ENABLED', false, 'Se desativado, o sistema opera em Modo Mock (simulação).', 'production'),
('PLUGIN_DELIVERY_ENABLED', true, 'Habilita a comunicação com o plugin para entrega de itens no jogo.', 'production'),
('REGISTRATION_ENABLED', true, 'Habilita ou bloqueia o registro de novos usuários no portal.', 'production'),
('MAINTENANCE_MODE', false, 'Bloqueia o acesso público ao portal com uma tela informativa.', 'production'),
('DEMO_RANKINGS_ENABLED', false, 'Exibe dados fictícios no ranking para preencher a interface.', 'production'),
('STORE_ENABLED', true, 'Habilita ou desabilita todo o sistema de compras do portal.', 'staging'),
('REAL_PAYMENTS_ENABLED', false, 'Se desativado, o sistema opera em Modo Mock (simulação).', 'staging'),
('PLUGIN_DELIVERY_ENABLED', true, 'Habilita a comunicação com o plugin para entrega de itens no jogo.', 'staging'),
('REGISTRATION_ENABLED', true, 'Habilita ou bloqueia o registro de novos usuários no portal.', 'staging'),
('MAINTENANCE_MODE', false, 'Bloqueia o acesso público ao portal com uma tela informativa.', 'staging'),
('DEMO_RANKINGS_ENABLED', true, 'Exibe dados fictícios no ranking para preencher a interface.', 'staging');
