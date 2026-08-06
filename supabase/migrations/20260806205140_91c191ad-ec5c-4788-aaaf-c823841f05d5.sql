-- Drop table if exists for clean state in migration
DROP TABLE IF EXISTS public.product_commands;

-- Create product_commands table
CREATE TABLE public.product_commands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    server_id text NOT NULL,
    event_type text NOT NULL DEFAULT 'purchase_approved',
    command_template text NOT NULL,
    execution_order integer DEFAULT 0,
    enabled boolean DEFAULT true,
    requires_online_player boolean DEFAULT false,
    delivery_delay_seconds integer DEFAULT 0,
    maximum_attempts integer DEFAULT 5,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Command Allowlist Table
CREATE TABLE public.command_allowlist (
    prefix text PRIMARY KEY,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Grants
GRANT SELECT ON public.product_commands TO authenticated;
GRANT ALL ON public.product_commands TO service_role;

GRANT SELECT ON public.command_allowlist TO authenticated;
GRANT ALL ON public.command_allowlist TO service_role;

-- RLS
ALTER TABLE public.product_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_allowlist ENABLE ROW LEVEL SECURITY;

-- Policies (Assuming 'admin' role check is needed, using our has_role helper)
CREATE POLICY "Admins can manage product_commands" ON public.product_commands
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage command_allowlist" ON public.command_allowlist
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Initial Allowlist
INSERT INTO public.command_allowlist (prefix, description) VALUES
('lp user', 'LuckPerms permissions'),
('eco give', 'Economy rewards'),
('minecraft:give', 'Native item giving'),
('give', 'Item giving'),
('crate', 'Crate rewards'),
('crates', 'Crate rewards alias'),
('kit', 'Kit rewards')
ON CONFLICT (prefix) DO NOTHING;
