-- RPC para processamento atômico de pagamentos aprovados e geração de entregas
CREATE OR REPLACE FUNCTION public.process_approved_payment(
    _payment_id uuid,
    _external_reference text,
    _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order record;
    v_payment record;
    v_item record;
    v_command record;
    v_delivery_id uuid;
    v_deliveries_created integer := 0;
    v_player_nick text;
BEGIN
    -- 1. Buscar e bloquear o pagamento para evitar concorrência (FOR UPDATE)
    SELECT * INTO v_payment FROM public.payments WHERE id = _payment_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'payment_not_found');
    END IF;

    -- 2. Verificar se já foi processado (Idempotência)
    IF v_payment.status = 'approved' THEN
        RETURN jsonb_build_object('success', true, 'message', 'already_processed', 'deliveries_count', 0);
    END IF;

    -- 3. Buscar o pedido associado
    SELECT * INTO v_order FROM public.orders WHERE id = v_payment.order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'order_not_found');
    END IF;

    -- 4. Validações de estado do pedido
    IF v_order.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'order_cancelled');
    END IF;

    v_player_nick := v_order.minecraft_nickname;
    IF v_player_nick IS NULL OR v_player_nick = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_player_nick');
    END IF;

    -- 5. Atualizar status do pagamento e pedido
    UPDATE public.payments 
    SET status = 'approved', 
        updated_at = now(),
        provider_metadata = v_payment.provider_metadata || _metadata
    WHERE id = _payment_id;

    UPDATE public.orders 
    SET status = 'paid', 
        updated_at = now() 
    WHERE id = v_order.id;

    -- 6. Gerar entregas para cada item do pedido
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = v_order.id LOOP
        
        -- Buscar comandos ativos para o produto
        FOR v_command IN 
            SELECT * FROM public.product_commands 
            WHERE product_id = v_item.product_id AND enabled = true
            ORDER BY execution_order ASC
        LOOP
            -- Gerar idempotency_key determinística
            -- Formato: payment_id + order_item_id + command_id
            -- Usamos md5 para garantir um formato estável para a constraint
            
            INSERT INTO public.delivery_queue (
                order_item_id,
                server_id,
                command,
                status,
                available_at,
                maximum_attempts,
                idempotency_key
            ) VALUES (
                v_item.id,
                v_command.server_id,
                -- O comando final será construído no worker/backend para segurança AAA, 
                -- aqui salvamos o template ou um marcador se necessário. 
                -- Mas para seguir o requisito de ser atômico e imutável:
                v_command.command_template, -- O worker usará buildDeliveryCommands
                'queued',
                now() + (v_command.delivery_delay_seconds || ' seconds')::interval,
                v_command.maximum_attempts,
                md5(_payment_id::text || v_item.id::text || v_command.id::text)
            )
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id INTO v_delivery_id;

            IF v_delivery_id IS NOT NULL THEN
                v_deliveries_created := v_deliveries_created + 1;
            END IF;
        END LOOP;
    END LOOP;

    -- 7. Auditoria
    INSERT INTO public.audit_logs (
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        'payment_approved_auto_delivery',
        'payment',
        _payment_id,
        jsonb_build_object(
            'order_id', v_order.id,
            'deliveries_created', v_deliveries_created,
            'player', v_player_nick
        )
    );

    RETURN jsonb_build_object(
        'success', true, 
        'deliveries_count', v_deliveries_created,
        'order_id', v_order.id
    );
END;
$$;
