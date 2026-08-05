-- 1. Criar Tipo Enum para Status do Beta
CREATE TYPE public.beta_status AS ENUM ('invited', 'registered', 'approved', 'active', 'blocked');

-- 2. Criar Tabela de Convites Beta
CREATE TABLE public.beta_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    uses_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    active BOOLEAN DEFAULT true
);

-- 3. Criar Tabela de Participantes Beta
CREATE TABLE public.beta_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
    invite_id UUID REFERENCES public.beta_invites(id),
    status public.beta_status NOT NULL DEFAULT 'registered',
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Habilitar RLS e Permissões
ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_participants ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.beta_invites TO authenticated;
GRANT ALL ON public.beta_invites TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.beta_participants TO authenticated;
GRANT ALL ON public.beta_participants TO service_role;

-- 5. Políticas RLS
-- Staff pode ver tudo
CREATE POLICY "Staff can manage beta invites" ON public.beta_invites
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can manage beta participants" ON public.beta_participants
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Usuário pode ver seu próprio status de participante
CREATE POLICY "Users can see their own beta status" ON public.beta_participants
    FOR SELECT TO authenticated
    USING (profile_id = auth.uid());

-- Função para validar e usar convite (Security Definer para garantir atomicidade e ignorar RLS durante o processo)
CREATE OR REPLACE FUNCTION public.use_beta_invite(_code TEXT, _profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _invite_id UUID;
BEGIN
    -- 1. Buscar convite válido
    SELECT id INTO _invite_id 
    FROM public.beta_invites 
    WHERE code = _code 
      AND active = true 
      AND uses_count < max_uses 
      AND (expires_at IS NULL OR expires_at > now());

    IF _invite_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Convite inválido, expirado ou esgotado.');
    END IF;

    -- 2. Verificar se o usuário já é participante
    IF EXISTS (SELECT 1 FROM public.beta_participants WHERE profile_id = _profile_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Você já está registrado no programa Beta.');
    END IF;

    -- 3. Incrementar uso do convite
    UPDATE public.beta_invites 
    SET uses_count = uses_count + 1 
    WHERE id = _invite_id;

    -- 4. Criar participante
    INSERT INTO public.beta_participants (profile_id, invite_id, status)
    VALUES (_profile_id, _invite_id, 'registered');

    RETURN jsonb_build_object('success', true);
END;
$$;
