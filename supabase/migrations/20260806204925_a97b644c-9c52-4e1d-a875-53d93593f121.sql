-- 1. Valores do Enum delivery_status
ALTER TYPE public.delivery_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.delivery_status ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE public.delivery_status ADD VALUE IF NOT EXISTS 'retry';

-- 2. Colunas na delivery_queue
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS maximum_attempts INTEGER DEFAULT 5;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS reserved_by TEXT;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS last_error_code TEXT;
ALTER TABLE public.delivery_queue ADD COLUMN IF NOT EXISTS last_error_message TEXT;

-- 3. Índices (Sem cast para text para evitar erro de IMMUTABLE)
DROP INDEX IF EXISTS idx_delivery_queue_process;
CREATE INDEX idx_delivery_queue_process ON public.delivery_queue (server_id, status, available_at);

DROP INDEX IF EXISTS idx_delivery_queue_reserved;
CREATE INDEX idx_delivery_queue_reserved ON public.delivery_queue (reservation_expires_at);

-- 4. RPC: reserve_delivery_batch
CREATE OR REPLACE FUNCTION public.reserve_delivery_batch(
    _server_id TEXT,
    _plugin_instance_id TEXT,
    _limit INTEGER DEFAULT 10
)
RETURNS SETOF public.delivery_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH batch AS (
        SELECT id
        FROM public.delivery_queue
        WHERE server_id = _server_id
          AND (
            status = 'pending'::public.delivery_status
            OR (status = 'retry'::public.delivery_status AND available_at <= now())
            OR (status = 'reserved'::public.delivery_status AND reservation_expires_at <= now())
          )
        ORDER BY priority DESC, created_at ASC
        LIMIT _limit
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.delivery_queue q
    SET status = 'reserved'::public.delivery_status,
        reserved_at = now(),
        reserved_by = _plugin_instance_id,
        reservation_expires_at = now() + interval '5 minutes',
        attempts = q.attempts + 1,
        updated_at = now()
    FROM batch
    WHERE q.id = batch.id
    RETURNING q.*;
END;
$$;

-- 5. RPC: confirm_delivery
CREATE OR REPLACE FUNCTION public.confirm_delivery(
    _delivery_id UUID,
    _response_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status public.delivery_status;
BEGIN
    SELECT status INTO v_status FROM public.delivery_queue WHERE id = _delivery_id FOR UPDATE;
    
    IF v_status = 'delivered'::public.delivery_status THEN
        RETURN TRUE;
    END IF;

    UPDATE public.delivery_queue
    SET status = 'delivered'::public.delivery_status,
        delivered_at = now(),
        reserved_at = NULL,
        reserved_by = NULL,
        reservation_expires_at = NULL,
        updated_at = now()
    WHERE id = _delivery_id;

    INSERT INTO public.delivery_attempts (delivery_id, success, response_payload)
    VALUES (_delivery_id, TRUE, _response_payload);

    RETURN TRUE;
END;
$$;

-- 6. RPC: fail_delivery
CREATE OR REPLACE FUNCTION public.fail_delivery(
    _delivery_id UUID,
    _error_code TEXT,
    _error_message TEXT,
    _response_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempts INTEGER;
    v_max_attempts INTEGER;
BEGIN
    SELECT attempts, maximum_attempts INTO v_attempts, v_max_attempts 
    FROM public.delivery_queue 
    WHERE id = _delivery_id FOR UPDATE;

    IF v_attempts >= v_max_attempts THEN
        UPDATE public.delivery_queue
        SET status = 'failed'::public.delivery_status,
            failed_at = now(),
            last_error_code = _error_code,
            last_error_message = left(_error_message, 255),
            reserved_at = NULL,
            reserved_by = NULL,
            reservation_expires_at = NULL,
            updated_at = now()
        WHERE id = _delivery_id;
    ELSE
        UPDATE public.delivery_queue
        SET status = 'retry'::public.delivery_status,
            available_at = now() + (interval '1 minute' * pow(2, v_attempts)), -- Exponential Backoff
            last_error_code = _error_code,
            last_error_message = left(_error_message, 255),
            reserved_at = NULL,
            reserved_by = NULL,
            reservation_expires_at = NULL,
            updated_at = now()
        WHERE id = _delivery_id;
    END IF;

    INSERT INTO public.delivery_attempts (delivery_id, success, error_code, error_message, response_payload)
    VALUES (_delivery_id, FALSE, _error_code, _error_message, _response_payload);

    RETURN TRUE;
END;
$$;

GRANT ALL ON public.delivery_queue TO service_role;
GRANT ALL ON public.delivery_attempts TO service_role;
GRANT ALL ON public.delivery_queue TO authenticated;
GRANT ALL ON public.delivery_attempts TO authenticated;
