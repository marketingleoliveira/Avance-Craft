CREATE TYPE public.log_severity AS ENUM ('info', 'warn', 'error', 'critical', 'audit');

CREATE TABLE public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity log_severity NOT NULL DEFAULT 'info',
    environment TEXT NOT NULL,
    service TEXT NOT NULL,
    module TEXT,
    action TEXT,
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}',
    request_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    order_id UUID,
    payment_id TEXT,
    plugin_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance em filtros do dashboard
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_service ON public.error_logs(service);

GRANT SELECT ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver os logs
CREATE POLICY "Admins can view logs" ON public.error_logs
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Função para limpeza automática de logs antigos (ex: > 30 dias)
CREATE OR REPLACE FUNCTION public.prune_old_logs(retention_days INT DEFAULT 30)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM public.error_logs
    WHERE created_at < now() - (retention_days || ' days')::interval;
$$;
