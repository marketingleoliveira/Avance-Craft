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
  discord: "#",
};

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image: string;
};

export const MOCK_NEWS: Omit<NewsItem, "image">[] = [
  {
    id: "1",
    title: "Habblet Mine está chegando",
    excerpt:
      "Estamos nos preparativos finais do servidor: mundo novo, plugins revisados e uma equipe pronta para receber a comunidade.",
    category: "Anúncio",
    date: "28/07/2026",
    author: "Equipe Habblet",
  },
  {
    id: "2",
    title: "Conheça o nosso Survival",
    excerpt:
      "Economia equilibrada, proteção de terrenos, missões diárias e clãs. Veja como será o modo principal do servidor.",
    category: "Modalidade",
    date: "22/07/2026",
    author: "Bloquinho",
  },
  {
    id: "3",
    title: "Evento de inauguração",
    excerpt:
      "Fogos, arena de desafios e recompensas de boas-vindas para quem entrar no primeiro fim de semana.",
    category: "Evento",
    date: "15/07/2026",
    author: "Equipe Habblet",
  },
];

export type GameMode = {
  id: string;
  name: string;
  description: string;
  status: "disponivel" | "em-breve";
};

export const MOCK_MODES: GameMode[] = [
  {
    id: "survival",
    name: "Survival",
    description: "Economia, missões, clãs e proteção de terreno no mundo principal.",
    status: "disponivel",
  },
  {
    id: "skyblock",
    name: "SkyBlock",
    description: "Comece numa ilha flutuante e expanda seu império bloco a bloco.",
    status: "em-breve",
  },
  {
    id: "rankup",
    name: "RankUP",
    description: "Minere, evolua de rank e desbloqueie novas áreas e vantagens.",
    status: "em-breve",
  },
  {
    id: "minigames",
    name: "Minigames",
    description: "Partidas rápidas, arenas competitivas e eventos com premiação.",
    status: "em-breve",
  },
];

export type ShopItem = {
  id: string;
  name: string;
  tag: string;
  period: string;
  price: string;
  perks: string[];
};

export const MOCK_SHOP: ShopItem[] = [
  {
    id: "vip-bronze",
    name: "VIP Bronze",
    tag: "Inicial",
    period: "30 dias",
    price: "R$ --",
    perks: ["Kit inicial", "2 homes extras", "Cor no chat"],
  },
  {
    id: "vip-ouro",
    name: "VIP Ouro",
    tag: "Popular",
    period: "30 dias",
    price: "R$ --",
    perks: ["Kit reforçado", "5 homes extras", "Acesso antecipado a eventos"],
  },
  {
    id: "vip-esmeralda",
    name: "VIP Esmeralda",
    tag: "Completo",
    period: "30 dias",
    price: "R$ --",
    perks: ["Kit completo", "Homes ilimitadas", "Prefixo exclusivo no chat"],
  },
];

export type RankingRow = {
  position: number;
  player: string;
  clan: string;
  score: string;
};

export type RankingTab = {
  id: string;
  label: string;
  metric: string;
  rows: RankingRow[];
};

const placeholderRows = (metric: string): RankingRow[] =>
  [1, 2, 3, 4, 5].map((position) => ({
    position,
    player: `Jogador_Exemplo${position}`,
    clan: ["Vale Verde", "Pedra Rúnica", "Vale Verde", "Sem clã", "Minérios BR"][position - 1]!,
    score: `— ${metric}`,
  }));

export const MOCK_RANKING_TABS: RankingTab[] = [
  { id: "ricos", label: "Mais ricos", metric: "moedas", rows: placeholderRows("moedas") },
  { id: "tempo", label: "Tempo online", metric: "horas", rows: placeholderRows("horas") },
  { id: "abates", label: "Abates", metric: "abates", rows: placeholderRows("abates") },
  { id: "missoes", label: "Missões", metric: "missões", rows: placeholderRows("missões") },
  { id: "votos", label: "Votos", metric: "votos", rows: placeholderRows("votos") },
];

/** Compatibilidade com telas antigas. */
export const MOCK_RANKING: RankingRow[] = MOCK_RANKING_TABS[0]!.rows;

export const MOCK_STEPS = [
  {
    step: "01",
    title: "Abra o Minecraft",
    text: "Use a versão Java ou Bedrock compatível listada na barra de status.",
  },
  {
    step: "02",
    title: "Adicione jogar.habbletmine.com.br",
    text: "No menu multijogador, adicione o endereço oficial do Habblet Mine.",
  },
  {
    step: "03",
    title: "Entre e comece sua aventura",
    text: "Escolha um modo de jogo no saguão e faça sua primeira construção.",
  },
];

/** placeholders — nenhum jogador real está conectado */
export const MOCK_LAST_PLAYERS = [
  "Jogador_Exemplo1",
  "Jogador_Exemplo2",
  "Jogador_Exemplo3",
  "Jogador_Exemplo4",
];

export const MOCK_EVENTS = [
  { id: "e1", title: "Abertura oficial", date: "A definir" },
  { id: "e2", title: "Corrida de construção", date: "A definir" },
  { id: "e3", title: "Caça ao tesouro", date: "A definir" },
];

export const SOCIAL_LINKS = [
  { label: "Discord", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "YouTube", href: "#" },
] as const;

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
