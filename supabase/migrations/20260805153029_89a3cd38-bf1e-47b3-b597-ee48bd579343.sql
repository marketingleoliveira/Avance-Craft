-- 1. Enums para Feedback
CREATE TYPE public.feedback_type AS ENUM ('bug', 'suggestion', 'economy', 'performance', 'bedrock', 'java', 'interface', 'shop', 'delivery', 'other');
CREATE TYPE public.feedback_status AS ENUM ('new', 'triaged', 'confirmed', 'in_progress', 'resolved', 'rejected', 'duplicate');
CREATE TYPE public.feedback_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- 2. Tabela de Feedbacks/Bugs
CREATE TABLE public.beta_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) NOT NULL,
    type public.feedback_type NOT NULL,
    status public.feedback_status NOT NULL DEFAULT 'new',
    severity public.feedback_severity NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_result TEXT,
    actual_result TEXT,
    minecraft_nickname TEXT,
    edition public.minecraft_edition,
    version TEXT,
    device_info TEXT,
    server_id TEXT,
    attachments TEXT[], -- URLs de imagens/vídeos
    contact_consent BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES auth.users(id),
    internal_notes TEXT,
    release_tag TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Comentários em Feedback
CREATE TABLE public.beta_feedback_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID REFERENCES public.beta_feedback(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Habilitar RLS e Permissões
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_feedback_comments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.beta_feedback TO authenticated;
GRANT ALL ON public.beta_feedback TO service_role;

GRANT SELECT, INSERT ON public.beta_feedback_comments TO authenticated;
GRANT ALL ON public.beta_feedback_comments TO service_role;

-- 5. Políticas RLS
-- Staff pode gerenciar tudo
CREATE POLICY "Staff can manage all feedback" ON public.beta_feedback
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can manage all feedback comments" ON public.beta_feedback_comments
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver seus próprios feedbacks
CREATE POLICY "Users can see their own feedback" ON public.beta_feedback
    FOR SELECT TO authenticated
    USING (profile_id = auth.uid());

-- Usuários podem enviar seus próprios feedbacks
CREATE POLICY "Users can create their own feedback" ON public.beta_feedback
    FOR INSERT TO authenticated
    WITH CHECK (profile_id = auth.uid());

-- Usuários podem ver comentários públicos em seus feedbacks
CREATE POLICY "Users can see public comments on their feedback" ON public.beta_feedback_comments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.beta_feedback f 
            WHERE f.id = feedback_id AND f.profile_id = auth.uid()
        ) AND is_internal = false
    );

-- Usuários podem comentar em seus próprios feedbacks
CREATE POLICY "Users can comment on their own feedback" ON public.beta_feedback_comments
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.beta_feedback f 
            WHERE f.id = feedback_id AND f.profile_id = auth.uid()
        ) AND profile_id = auth.uid() AND is_internal = false
    );
