-- Dropar e recriar para garantir integridade após erro de migração parcial
DROP TABLE IF EXISTS public.server_status;

CREATE TABLE public.server_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    server_id text UNIQUE NOT NULL REFERENCES public.minecraft_servers(server_id) ON DELETE CASCADE,
    online boolean DEFAULT false,
    online_players integer DEFAULT 0,
    max_players integer DEFAULT 100,
    tps numeric(4,2) DEFAULT 20.00,
    memory_used_mb integer,
    memory_max_mb integer,
    uptime_seconds bigint,
    plugin_version text,
    minecraft_version text,
    paper_version text,
    last_seen_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    maintenance_mode boolean DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.server_status ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.server_status TO authenticated, anon;
GRANT ALL ON public.server_status TO service_role;

-- Policies
CREATE POLICY "Public status is viewable by everyone" ON public.server_status
    FOR SELECT USING (true);

-- Trigger para updated_at (assumindo que o trigger function já existe da migration anterior ou recriando se necessário)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_server_status_updated_at
    BEFORE UPDATE ON public.server_status
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Seed inicial
INSERT INTO public.server_status (server_id, online, online_players, max_players)
VALUES ('habblet-survival-01', false, 0, 500);
