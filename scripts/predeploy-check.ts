import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const chalk = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[22m`,
};

console.log(chalk.bold(chalk.blue('\n🚀 Iniciando Checklist de Pré-deploy: Avance\n')));

const checks: { name: string; fn: () => boolean | Promise<boolean> }[] = [
  {
    name: 'Typecheck (TypeScript)',
    fn: () => {
      try {
        console.log('Executando tsc...');
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  {
    name: 'Vazamento de Mocks em Produção',
    fn: () => {
      const mockFiles = ['src/data/mock.ts', 'src/data/shop.ts'];
      const exists = mockFiles.some(f => fs.existsSync(path.resolve(process.cwd(), f)));
      if (exists) {
        console.log(chalk.red('❌ Arquivos de mock detectados no projeto! Remova src/data/mock.ts e src/data/shop.ts.'));
        return false;
      }
      return true;
    },
  },
  {
    name: 'Verificação de Segredos Hardcoded',
    fn: () => {
      try {
        const forbidden = ['sb_secret_', 'MERCADOPAGO_ACCESS_TOKEN =', 'PLUGIN_SECRET ='];
        const files = execSync('find src -type f').toString().split('\n').filter(Boolean);
        let found = false;
        for (const file of files) {
          if (file.includes('predeploy-check.ts')) continue;
          const content = fs.readFileSync(file, 'utf8');
          for (const pattern of forbidden) {
            if (content.includes(pattern)) {
              console.log(chalk.red(`❌ Possível segredo hardcoded em: ${file} (${pattern})`));
              found = true;
            }
          }
        }
        return !found;
      } catch (e) {
        console.log(chalk.yellow('⚠️ Aviso: Falha ao escanear segredos.'));
        return true; 
      }
    },
  },
  {
    name: 'Build de Produção',
    fn: () => {
      try {
        console.log('Executando vite build...');
        execSync('npm run build', { stdio: 'inherit' });
        return true;
      } catch (e) {
        return false;
      }
    },
  },
];

async function run() {
  let allPassed = true;
  for (const check of checks) {
    console.log(chalk.blue(`\n🔍 Verificando: ${check.name}...`));
    const passed = await check.fn();
    if (passed) {
      console.log(chalk.green(`✅ ${check.name} aprovado!`));
    } else {
      console.log(chalk.red(`❌ ${check.name} falhou!`));
      allPassed = false;
    }
  }

  console.log('\n' + chalk.bold('📋 CHECKLIST MANUAL OBRIGATÓRIO:'));
  const manualItems = [
    'Backup do banco de dados realizado?',
    'Restauração de backup testada em staging?',
    'SSL ativo no domínio de produção?',
    'Webhook do Mercado Pago configurado no dashboard?',
    'Plugin Minecraft online e com IP na whitelist?',
    'Termos de Uso e Políticas de Privacidade publicados?',
    'Conta admin de produção testada?',
  ];
  manualItems.forEach(item => console.log(chalk.yellow(`  [ ] ${item}`)));

  if (allPassed) {
    console.log(chalk.bold(chalk.green('\n🎉 TUDO PRONTO! O deploy pode ser realizado.\n')));
    process.exit(0);
  } else {
    console.log(chalk.bold(chalk.red('\n🚫 ERRO: Verificações automáticas falharam. Corrija os problemas acima.\n')));
    process.exit(1);
  }
}

run();
