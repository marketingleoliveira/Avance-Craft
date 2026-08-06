-- 1. Enum para Ambientes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'server_environment') THEN
        CREATE TYPE public.server_environment AS ENUM ('production', 'staging', 'development');
    END IF;
END $$;

-- 2. Tabela de Servidores Minecraft
CREATE TABLE IF NOT EXISTS public.minecraft_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    environment public.server_environment NOT NULL DEFAULT 'production',
    enabled BOOLEAN DEFAULT TRUE,
    secret_hash TEXT NOT NULL,
    previous_secret_hash TEXT,
    previous_secret_expires_at TIMESTAMPTZ,
    allowed_ip_ranges JSONB DEFAULT '[]'::jsonb,
    plugin_version TEXT,
    minecraft_version TEXT,
    paper_version TEXT,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Nonces (Anti-replay)
CREATE TABLE IF NOT EXISTS public.plugin_nonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT NOT NULL REFERENCES public.minecraft_servers(server_id) ON DELETE CASCADE,
    nonce TEXT NOT NULL,
    request_timestamp TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(server_id, nonce)
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_minecraft_servers_enabled ON public.minecraft_servers(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_plugin_nonces_expires ON public.plugin_nonces(expires_at);

-- 5. RLS
ALTER TABLE public.minecraft_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_nonces ENABLE ROW LEVEL SECURITY;

-- 6. Grants
GRANT SELECT ON public.minecraft_servers TO authenticated;
GRANT ALL ON public.minecraft_servers TO service_role;
GRANT ALL ON public.plugin_nonces TO service_role;

-- 7. Políticas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view servers') THEN
        CREATE POLICY "Admins can view servers" 
        ON public.minecraft_servers 
        FOR SELECT 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- 8. Função de Limpeza
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.plugin_nonces WHERE expires_at < now();
$$;

-- 9. Trigger Updated At
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.minecraft_servers;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.minecraft_servers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
