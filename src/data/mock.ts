/**
 * DADOS MOCKADOS — placeholders visuais.
 * Nada aqui é real. Substituir por dados do backend (Lovable Cloud) no futuro.
 */

export const MOCK_SERVER = {
  name: "Habblet Mine",
  ip: "jogar.habbletmine.com.br",
  version: "1.21+ (Java & Bedrock)",
  /** placeholder — não representa jogadores reais */
  playersOnline: 0,
  slots: 500,
  status: "manutencao" as "online" | "manutencao" | "offline",
};

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
};

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Nova temporada de Survival chega em breve",
    excerpt:
      "Um novo mundo, novas regiões para explorar e sistema de clãs reformulado. Prepare sua picareta.",
    category: "Atualização",
    date: "12/07/2026",
  },
  {
    id: "2",
    title: "Evento de construção comunitária",
    excerpt:
      "Monte sua equipe e construa a vila mais criativa do servidor. Prévia das regras já disponível.",
    category: "Evento",
    date: "05/07/2026",
  },
  {
    id: "3",
    title: "Ajustes de economia e mercado de jogadores",
    excerpt:
      "Rebalanceamento de preços das lojas de aldeões e novas regras para leilões entre jogadores.",
    category: "Notas",
    date: "28/06/2026",
  },
];

export type ShopItem = {
  id: string;
  name: string;
  tag: string;
  price: string;
  perks: string[];
};

export const MOCK_SHOP: ShopItem[] = [
  {
    id: "vip-terra",
    name: "VIP Terra",
    tag: "Inicial",
    price: "R$ --",
    perks: ["Kit inicial", "1 home extra", "Cor no chat"],
  },
  {
    id: "vip-ferro",
    name: "VIP Ferro",
    tag: "Popular",
    price: "R$ --",
    perks: ["Kit reforçado", "3 homes extras", "Acesso a eventos"],
  },
  {
    id: "vip-esmeralda",
    name: "VIP Esmeralda",
    tag: "Completo",
    price: "R$ --",
    perks: ["Kit completo", "Homes ilimitadas", "Prefixo exclusivo"],
  },
];

export type RankingRow = {
  position: number;
  player: string;
  clan: string;
  score: string;
};

export const MOCK_RANKING: RankingRow[] = [
  { position: 1, player: "Jogador_Exemplo1", clan: "Vale Verde", score: "—" },
  { position: 2, player: "Jogador_Exemplo2", clan: "Pedra Rúnica", score: "—" },
  { position: 3, player: "Jogador_Exemplo3", clan: "Vale Verde", score: "—" },
  { position: 4, player: "Jogador_Exemplo4", clan: "Sem clã", score: "—" },
  { position: 5, player: "Jogador_Exemplo5", clan: "Minérios BR", score: "—" },
];

export const MOCK_STEPS = [
  {
    step: "01",
    title: "Abra o jogo",
    text: "Use a versão Java ou Bedrock compatível listada na barra de status.",
  },
  {
    step: "02",
    title: "Adicione o servidor",
    text: "No menu multijogador, adicione o endereço oficial do Habblet Mine.",
  },
  {
    step: "03",
    title: "Entre e explore",
    text: "Escolha um modo de jogo no saguão e comece sua primeira construção.",
  },
];

export const NAV_LINKS = [
  { label: "Início", to: "/" },
  { label: "Loja", to: "/loja" },
  { label: "Notícias", to: "/noticias" },
  { label: "Ranking", to: "/ranking" },
  { label: "Como Jogar", to: "/como-jogar" },
  { label: "Regras", to: "/regras" },
  { label: "Equipe", to: "/equipe" },
  { label: "Suporte", to: "/suporte" },
] as const;
