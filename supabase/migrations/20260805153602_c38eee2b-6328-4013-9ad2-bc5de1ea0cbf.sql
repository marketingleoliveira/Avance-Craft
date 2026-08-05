create table if not exists public.pages (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    content text not null,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    version integer not null default 1,
    last_modified_by uuid references auth.users(id)
);

grant select on public.pages to anon, authenticated;
grant all on public.pages to service_role;

alter table public.pages enable row level security;

-- Drop existing if any to avoid errors during re-runs
drop policy if exists "Pages are viewable by everyone" on public.pages;
drop policy if exists "Admins can manage pages" on public.pages;

create policy "Pages are viewable by everyone" on public.pages
    for select using (published = true);

create policy "Admins can manage pages" on public.pages
    for all to authenticated
    using (public.has_role(auth.uid(), 'admin'));

-- Default site settings for institutional info
insert into public.site_settings (key, value, is_public)
values 
('business_cnpj', '"00.000.000/0000-00"', true),
('business_address', '"Endereço Comercial, Cidade - UF"', true),
('business_email', '"contato@avance.com.br"', true),
('business_legal_name', '"Avance Entretenimento Digital LTDA"', true)
on conflict (key) do nothing;
