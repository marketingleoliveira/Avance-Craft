/**
 * @deprecated ESTE ARQUIVO ESTÁ DEPRECIADO.
 * A rota /loja e o sistema de catálogo agora utilizam exclusivamente catalog.functions.ts 
 * para buscar dados reais do banco (Lovable Cloud).
 * Não utilize SHOP_PRODUCTS ou SHOP_CATEGORIES para novas implementações.
 */


export type ShopCategoryId =
  | "vips"
  | "cash"
  | "chaves"
  | "kits"
  | "cosmeticos"
  | "passe";

export type ShopCategory = {
  id: ShopCategoryId;
  label: string;
  description: string;
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  { id: "vips", label: "VIPs", description: "Assinaturas com vantagens no servidor." },
  { id: "cash", label: "Cash", description: "Moeda da loja para usar em qualquer item." },
  { id: "chaves", label: "Chaves", description: "Abra baús com recompensas aleatórias." },
  { id: "kits", label: "Kits", description: "Pacotes de itens entregues no jogo." },
  { id: "cosmeticos", label: "Cosméticos", description: "Efeitos, capas e partículas." },
  { id: "passe", label: "Passe de temporada", description: "Missões e recompensas da temporada." },
];

export type Platform = "java" | "bedrock";

export type ShopProduct = {
  id: string;
  category: ShopCategoryId;
  name: string;
  shortDescription: string;
  fullDescription: string;
  perks: string[];
  commands: string[];
  /** valores mockados em centavos, apenas para exibição */
  priceCents: number;
  previousPriceCents?: number;
  duration: string;
  badge?: string;
  platforms: Platform[];
  /** índice do sprite em vip-chests.png (0-2) */
  art: number;
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "vip-bronze",
    category: "vips",
    name: "VIP Bronze",
    shortDescription: "O primeiro passo para quem está começando no Survival.",
    fullDescription:
      "Assinatura inicial com kit de boas-vindas, homes extras e cor no chat. Ideal para quem quer apoiar o servidor sem grandes vantagens competitivas.",
    perks: ["Kit inicial semanal", "2 homes extras", "Cor no chat", "Prefixo [Bronze]"],
    commands: ["/kit bronze", "/sethome", "/chatcolor"],
    priceCents: 1490,
    duration: "30 dias",
    platforms: ["java", "bedrock"],
    art: 0,
  },
  {
    id: "vip-ouro",
    category: "vips",
    name: "VIP Ouro",
    shortDescription: "O pacote mais escolhido pela comunidade.",
    fullDescription:
      "Kit reforçado, mais homes, acesso antecipado a eventos e fila prioritária quando o servidor estiver cheio.",
    perks: ["Kit reforçado", "5 homes extras", "Fila prioritária", "Acesso antecipado a eventos"],
    commands: ["/kit ouro", "/fly (spawn)", "/craft", "/ec"],
    priceCents: 2990,
    previousPriceCents: 3990,
    duration: "30 dias",
    badge: "Mais vendido",
    platforms: ["java", "bedrock"],
    art: 1,
  },
  {
    id: "vip-esmeralda",
    category: "vips",
    name: "VIP Esmeralda",
    shortDescription: "Todas as vantagens disponíveis do servidor.",
    fullDescription:
      "Nível máximo de assinatura: homes ilimitadas, prefixo exclusivo, cosméticos liberados e participação em sorteios mensais.",
    perks: ["Kit completo", "Homes ilimitadas", "Prefixo exclusivo", "Cosméticos liberados"],
    commands: ["/kit esmeralda", "/fly", "/pet", "/nick"],
    priceCents: 4990,
    previousPriceCents: 5990,
    duration: "30 dias",
    badge: "Completo",
    platforms: ["java", "bedrock"],
    art: 2,
  },
  {
    id: "cash-1000",
    category: "cash",
    name: "1.000 Cash",
    shortDescription: "Moeda da loja para trocar por qualquer item.",
    fullDescription:
      "O Cash é creditado na conta vinculada ao nick informado e pode ser usado dentro do jogo na loja virtual.",
    perks: ["Crédito imediato após confirmação", "Sem validade", "Transferível entre modos"],
    commands: ["/cash", "/loja"],
    priceCents: 990,
    duration: "Sem validade",
    platforms: ["java", "bedrock"],
    art: 1,
  },
  {
    id: "cash-5000",
    category: "cash",
    name: "5.000 Cash + 10% bônus",
    shortDescription: "Pacote maior com bônus de crédito.",
    fullDescription:
      "Recebe 5.000 de Cash mais 500 de bônus creditados automaticamente na mesma conta.",
    perks: ["500 de Cash bônus", "Sem validade", "Melhor custo-benefício"],
    commands: ["/cash", "/loja"],
    priceCents: 3990,
    previousPriceCents: 4490,
    duration: "Sem validade",
    badge: "Bônus 10%",
    platforms: ["java", "bedrock"],
    art: 2,
  },
  {
    id: "chave-comum",
    category: "chaves",
    name: "Chave Comum (x5)",
    shortDescription: "Cinco chaves para o baú comum do spawn.",
    fullDescription:
      "Cada chave abre um baú com recompensas aleatórias como blocos, comida, minérios e pequenas quantias de moedas.",
    perks: ["5 aberturas", "Recompensas aleatórias", "Entrega instantânea"],
    commands: ["/chaves", "/abrir comum"],
    priceCents: 1290,
    duration: "Uso único",
    platforms: ["java", "bedrock"],
    art: 0,
  },
  {
    id: "chave-lendaria",
    category: "chaves",
    name: "Chave Lendária (x3)",
    shortDescription: "Chances maiores de itens raros.",
    fullDescription:
      "Baú lendário com equipamentos encantados, cosméticos temporários e grandes quantias de moedas.",
    perks: ["3 aberturas", "Itens encantados", "Chance de cosmético raro"],
    commands: ["/chaves", "/abrir lendaria"],
    priceCents: 2790,
    duration: "Uso único",
    badge: "Raro",
    platforms: ["java", "bedrock"],
    art: 2,
  },
  {
    id: "kit-minerador",
    category: "kits",
    name: "Kit Minerador",
    shortDescription: "Ferramentas encantadas para começar minerando forte.",
    fullDescription:
      "Conjunto com picareta encantada, tochas, comida e escudo. Pode ser resgatado uma vez por semana enquanto ativo.",
    perks: ["Picareta Eficiência IV", "64 tochas", "Comida e escudo"],
    commands: ["/kit minerador"],
    priceCents: 1990,
    duration: "Resgate semanal por 30 dias",
    platforms: ["java", "bedrock"],
    art: 0,
  },
  {
    id: "kit-construtor",
    category: "kits",
    name: "Kit Construtor",
    shortDescription: "Blocos variados para grandes construções.",
    fullDescription:
      "Pacote com blocos decorativos, andaimes e ferramentas de construção para acelerar seus projetos.",
    perks: ["Blocos decorativos", "Andaimes", "Ferramentas de construção"],
    commands: ["/kit construtor"],
    priceCents: 1790,
    duration: "Resgate semanal por 30 dias",
    platforms: ["java", "bedrock"],
    art: 1,
  },
  {
    id: "cosmetico-particulas",
    category: "cosmeticos",
    name: "Partículas Esmeralda",
    shortDescription: "Efeito visual que acompanha seu personagem.",
    fullDescription:
      "Rastro de partículas verdes ativado por comando. Puramente visual, sem qualquer vantagem de jogo.",
    perks: ["Efeito ativável", "Visível para todos", "Sem vantagem competitiva"],
    commands: ["/cosmeticos", "/particulas esmeralda"],
    priceCents: 990,
    duration: "Permanente",
    platforms: ["java"],
    art: 2,
  },
  {
    id: "cosmetico-capa",
    category: "cosmeticos",
    name: "Capa do Vale Verde",
    shortDescription: "Capa exclusiva renderizada no servidor.",
    fullDescription:
      "Capa cosmética exibida apenas dentro do Habblet Mine. Compatível somente com a edição Java.",
    perks: ["Exclusiva do servidor", "Troca livre no menu", "Permanente"],
    commands: ["/cosmeticos", "/capa"],
    priceCents: 1490,
    duration: "Permanente",
    platforms: ["java"],
    art: 0,
  },
  {
    id: "passe-temporada",
    category: "passe",
    name: "Passe de Temporada 1",
    shortDescription: "Missões diárias e 40 níveis de recompensa.",
    fullDescription:
      "Acompanha a temporada atual com missões diárias e semanais, recompensas exclusivas a cada nível e cosméticos de fim de trilha.",
    perks: ["40 níveis de recompensa", "Missões diárias", "Cosmético exclusivo final"],
    commands: ["/passe", "/missoes"],
    priceCents: 3490,
    previousPriceCents: 3990,
    duration: "Toda a temporada (90 dias)",
    badge: "Lançamento",
    platforms: ["java", "bedrock"],
    art: 1,
  },
];

/** Cupons mockados — validação real deve acontecer no backend. */
export const MOCK_COUPONS: Record<string, number> = {
  HABBLET10: 0.1,
  BEMVINDO5: 0.05,
};

export const SHOP_FAQ = [
  {
    q: "Em quanto tempo recebo minha compra?",
    a: "Assim que o pagamento for confirmado, os itens são entregues automaticamente na conta do nick informado. Nesta versão do site nada é cobrado — a loja é apenas demonstrativa.",
  },
  {
    q: "Preciso estar online para receber?",
    a: "Não. As entregas ficam pendentes e são aplicadas no seu próximo login.",
  },
  {
    q: "Errei meu nick, e agora?",
    a: "Abra um chamado no suporte com o comprovante. Correções de nick são feitas manualmente pela equipe.",
  },
  {
    q: "Java e Bedrock recebem os mesmos itens?",
    a: "A maioria sim. Alguns cosméticos dependem de recursos exclusivos da edição Java e estão marcados no produto.",
  },
  {
    q: "Posso pedir reembolso?",
    a: "Sim, dentro de 7 dias da compra, conforme o Código de Defesa do Consumidor, desde que os benefícios não tenham sido consumidos.",
  },
];

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
