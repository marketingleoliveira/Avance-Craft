CREATE OR REPLACE FUNCTION public.process_checkout(
  p_nickname TEXT,
  p_edition TEXT,
  p_items JSONB,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile_id UUID;
  v_order_id UUID;
  v_subtotal NUMERIC(12,2) := 0;
  v_discount NUMERIC(12,2) := 0;
  v_total NUMERIC(12,2) := 0;
  v_coupon_id UUID;
  v_item RECORD;
  v_product RECORD;
  v_discount_percent NUMERIC(5,2);
  v_discount_amount NUMERIC(12,2);
  v_idempotency_key TEXT := gen_random_uuid()::text;
BEGIN
  -- 1. Validar Usuário
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = v_user_id;
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado para o usuário %', v_user_id;
  END IF;

  -- 2. Validar Itens e Preços (Atomicidade de Leitura)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(productId UUID, quantity INT) LOOP
    SELECT * INTO v_product FROM public.products WHERE id = v_item.productId AND active = true FOR SHARE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto não encontrado ou inativo';
    END IF;

    IF v_item.quantity <= 0 OR v_item.quantity > 99 THEN
      RAISE EXCEPTION 'Quantidade inválida para o produto %', v_product.name;
    END IF;

    v_subtotal := v_subtotal + (COALESCE(v_product.promotional_price, v_product.price) * v_item.quantity);
  END LOOP;

  -- 3. Validar Cupom (se fornecido)
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    SELECT id, discount_percent, discount_amount 
    INTO v_coupon_id, v_discount_percent, v_discount_amount
    FROM public.coupons 
    WHERE code = UPPER(TRIM(p_coupon_code)) AND active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at >= now())
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cupom inválido ou expirado';
    END IF;

    IF (SELECT uses_count FROM public.coupons WHERE id = v_coupon_id) >= COALESCE((SELECT max_uses FROM public.coupons WHERE id = v_coupon_id), 999999) THEN
      RAISE EXCEPTION 'Este cupom atingiu o limite de uso global';
    END IF;

    IF EXISTS (SELECT 1 FROM public.coupon_uses WHERE coupon_id = v_coupon_id AND profile_id = v_profile_id) THEN
      RAISE EXCEPTION 'Você já utilizou este cupom anteriormente';
    END IF;

    IF v_discount_percent IS NOT NULL THEN
      v_discount := v_subtotal * (v_discount_percent / 100);
    ELSIF v_discount_amount IS NOT NULL THEN
      v_discount := v_discount_amount;
    END IF;

    v_discount := LEAST(v_subtotal, v_discount);
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount);

  -- 4. Criar Pedido
  INSERT INTO public.orders (
    profile_id,
    minecraft_nickname,
    edition,
    status,
    subtotal,
    discount,
    total,
    coupon_id,
    payment_provider,
    idempotency_key
  ) VALUES (
    v_profile_id,
    TRIM(p_nickname),
    p_edition::public.minecraft_edition,
    'pending',
    v_subtotal,
    v_discount,
    v_total,
    v_coupon_id,
    'mercadopago',
    v_idempotency_key
  ) RETURNING id INTO v_order_id;

  -- 5. Criar Itens do Pedido
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(productId UUID, quantity INT) LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      total
    ) 
    SELECT 
      v_order_id,
      id,
      name,
      COALESCE(promotional_price, price),
      v_item.quantity,
      (COALESCE(promotional_price, price) * v_item.quantity)
    FROM public.products
    WHERE id = v_item.productId;
  END LOOP;

  -- 6. Registrar Uso do Cupom
  IF v_coupon_id IS NOT NULL THEN
    INSERT INTO public.coupon_uses (coupon_id, order_id, profile_id)
    VALUES (v_coupon_id, v_order_id, v_profile_id);

    UPDATE public.coupons SET uses_count = uses_count + 1 WHERE id = v_coupon_id;
  END IF;

  -- 7. Audit Log
  INSERT INTO public.audit_logs (
    actor_profile_id,
    action,
    entity,
    entity_id,
    metadata
  ) VALUES (
    v_profile_id,
    'create_order',
    'order',
    v_order_id::text,
    jsonb_build_object(
      'total', v_total,
      'coupon_code', p_coupon_code,
      'idempotency_key', v_idempotency_key
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'orderId', v_order_id,
    'total', v_total
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_checkout(TEXT, TEXT, JSONB, TEXT) TO authenticated;
GRANT ALL ON FUNCTION public.process_checkout(TEXT, TEXT, JSONB, TEXT) TO service_role;