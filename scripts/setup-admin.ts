import { supabaseAdmin } from './src/integrations/supabase/client.server';

async function createInitialAdmin() {
  const email = 'marketing@digitaletextil.com.br';
  const password = 'Psngames12!';

  console.log(`Verificando existência do usuário: ${email}`);

  // 1. Criar o usuário na tabela auth.users via Admin API
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true 
  });

  if (userError) {
    if (userError.message.includes('already exists')) {
      console.log('Usuário já existe. Buscando ID...');
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users.find(u => u.email === email);
      if (existingUser) {
        await assignAdminRole(existingUser.id);
      }
    } else {
      console.error('Erro ao criar usuário:', userError);
    }
  } else if (userData?.user) {
    console.log('Usuário criado com sucesso:', userData.user.id);
    await assignAdminRole(userData.user.id);
  }
}

async function assignAdminRole(userId: string) {
  console.log(`Atribuindo cargo de admin ao usuário: ${userId}`);
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });

  if (roleError) {
    console.error('Erro ao atribuir cargo:', roleError);
  } else {
    console.log('Cargo de admin atribuído com sucesso.');
  }
}

createInitialAdmin().catch(console.error);
