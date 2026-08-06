-- Refatoração/Aprimoramento da tabela player_accounts
ALTER TABLE public.player_accounts 
    ADD COLUMN IF NOT EXISTS verification_code_hash text,
    ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
    ADD COLUMN IF NOT EXISTS last_username_check_at timestamptz,
    ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Garantir que uuid possa ser nulo inicialmente
ALTER TABLE public.player_accounts ALTER COLUMN uuid DROP NOT NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_player_accounts_verification_code_hash ON public.player_accounts(verification_code_hash);
CREATE INDEX IF NOT EXISTS idx_player_accounts_profile_id ON public.player_accounts(profile_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_accounts TO authenticated;
GRANT ALL ON public.player_accounts TO service_role;

-- RLS Policies
ALTER TABLE public.player_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own account links" ON public.player_accounts
    FOR ALL TO authenticated USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all account links" ON public.player_accounts
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
