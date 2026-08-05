insert into public.pages (slug, title, content, version)
values 
('termos', 'Termos de Compra e Uso', '<h2>1. Aceitação</h2><p>Ao utilizar este portal e realizar compras, você concorda com estes termos.</p><h2>2. Itens Digitais</h2><p>As compras consistem em itens digitais para uso exclusivo no servidor Habblet Mine.</p><h2>3. Prazos</h2><p>A entrega é automática mas pode levar até 1 hora em casos de instabilidade.</p>', 1),
('privacidade', 'Política de Privacidade', '<h2>1. Coleta de Dados</h2><p>Coletamos seu nickname e logs de transação para fins de entrega e segurança.</p><h2>2. Uso de Cookies</h2><p>Utilizamos cookies essenciais para manter sua sessão de checkout ativa.</p>', 1),
('reembolso', 'Política de Reembolso', '<h2>1. Direito de Arrependimento</h2><p>Devido à natureza digital e consumo imediato dos itens, o reembolso é limitado.</p><h2>2. Chargebacks</h2><p>A abertura de chargeback sem contato prévio resultará em banimento permanente.</p>', 1),
('regras', 'Regras do Servidor', '<h2>1. Respeito</h2><p>Mantenha um comportamento cordial com todos os jogadores.</p><h2>2. Trapaças</h2><p>O uso de modificações não autorizadas é estritamente proibido.</p>', 1)
on conflict (slug) do update set content = excluded.content, title = excluded.title;
