-- Esta migração garante que o servidor principal use avance-survival-01 e tenha um novo segredo.
-- O hash SHA-256 fornecido pelo passo anterior será usado aqui.

DO $$ 
DECLARE
    new_hash_val TEXT := '369e069df8b1fdf3b1c6762391219b67482a5135760634674751359e19641756'; -- Placeholder que será substituído pelo valor real do exec
BEGIN
    -- 1. Se existir o ID antigo, renomear (ON CONFLICT ou UPDATE direto)
    -- Verificamos se 'avance-survival-01' já existe. Se não, tentamos migrar de 'habblet-survival-01'
    IF EXISTS (SELECT 1 FROM public.minecraft_servers WHERE server_id = 'habblet-survival-01') AND NOT EXISTS (SELECT 1 FROM public.minecraft_servers WHERE server_id = 'avance-survival-01') THEN
        UPDATE public.minecraft_servers SET server_id = 'avance-survival-01' WHERE server_id = 'habblet-survival-01';
    END IF;

    -- 2. Atualizar o hash do segredo para o novo gerado
    UPDATE public.minecraft_servers 
    SET secret_hash = new_hash_val,
        enabled = true,
        display_name = 'Avance Survival #01',
        updated_at = now()
    WHERE server_id = 'avance-survival-01';
END $$;
