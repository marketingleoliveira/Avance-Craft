-- Cadastro da primeira instância Minecraft
-- Importante: O secret_hash deve ser um hash seguro. 
-- Para este exemplo inicial, usaremos um placeholder que deve ser rotacionado.

INSERT INTO public.minecraft_servers (
    server_id,
    display_name,
    environment,
    enabled,
    secret_hash,
    allowed_ip_ranges
) VALUES (
    'habblet-survival-01',
    'Avance Survival #01',
    'production',
    true,
    'sha256:8888888888888888888888888888888888888888888888888888888888888888', -- Placeholder de 64 chars
    '["0.0.0.0/0"]' -- Permite qualquer IP inicialmente (restringir em prod)
) ON CONFLICT (server_id) DO NOTHING;
