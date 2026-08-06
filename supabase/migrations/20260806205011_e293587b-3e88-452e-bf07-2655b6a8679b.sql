-- 1. RPC: release_expired_deliveries
CREATE OR REPLACE FUNCTION public.release_expired_deliveries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH released AS (
        UPDATE public.delivery_queue
        SET status = 'retry'::public.delivery_status,
            reserved_at = NULL,
            reserved_by = NULL,
            reservation_expires_at = NULL,
            available_at = now() + interval '1 minute',
            updated_at = now()
        WHERE status = 'reserved'::public.delivery_status
          AND reservation_expires_at <= now()
        RETURNING id
    )
    SELECT count(*) INTO v_count FROM released;
    
    RETURN v_count;
END;
$$;

-- 2. RPC: cancel_delivery
CREATE OR REPLACE FUNCTION public.cancel_delivery(
    _delivery_id UUID,
    _reason TEXT DEFAULT 'Cancelled by admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.delivery_queue
    SET status = 'cancelled'::public.delivery_status,
        last_error_message = _reason,
        reserved_at = NULL,
        reserved_by = NULL,
        reservation_expires_at = NULL,
        updated_at = now()
    WHERE id = _delivery_id
      AND status NOT IN ('delivered'::public.delivery_status, 'failed'::public.delivery_status);

    RETURN FOUND;
END;
$$;
