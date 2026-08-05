insert into public.pages (slug, title, content, version)
values 
('seguranca', 'Segurança da Conta', '<h2>1. Proteção de Senha</h2><p>Nunca compartilhe sua senha. A staff nunca pedirá seus dados de acesso.</p><h2>2. Autenticação</h2><p>Recomendamos o uso de autenticação de dois fatores onde disponível.</p>', 1),
('compras', 'Guia de Compras', '<h2>1. Seleção</h2><p>Escolha seus itens na loja e adicione ao carrinho.</p><h2>2. Pagamento</h2><p>Utilize o Mercado Pago para transações seguras via PIX ou Cartão.</p><h2>3. Entrega</h2><p>Acesse o servidor para receber seus itens automaticamente após a aprovação.</p>', 1)
on conflict (slug) do update set content = excluded.content, title = excluded.title;
