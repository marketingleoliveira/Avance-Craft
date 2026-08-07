-- Desativa as restrições de FK temporariamente para renomear a chave primária globalmente
-- Ou atualiza de forma atômica se possível. 
-- Como server_id não tem ON UPDATE CASCADE, faremos manualmente em ordem.

DO $$ 
BEGIN
    -- 1. Cria a nova instância se não existir
    INSERT INTO public.minecraft_servers (server_id, display_name, environment, enabled, secret_hash, allowed_ip_ranges)
    SELECT 'avance-survival-01', display_name, environment, enabled, secret_hash, allowed_ip_ranges
    FROM public.minecraft_servers
    WHERE server_id = 'habblet-survival-01'
    ON CONFLICT (server_id) DO NOTHING;

    -- 2. Atualiza referências
    UPDATE public.server_status SET server_id = 'avance-survival-01' WHERE server_id = 'habblet-survival-01';
    UPDATE public.delivery_queue SET server_id = 'avance-survival-01' WHERE server_id = 'habblet-survival-01';
    UPDATE public.product_commands SET server_id = 'avance-survival-01' WHERE server_id = 'habblet-survival-01';
    
    -- 3. Remove a antiga
    DELETE FROM public.minecraft_servers WHERE server_id = 'habblet-survival-01';
END $$;
