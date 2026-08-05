import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Função de servidor para popular o banco de dados com dados iniciais.
 * Protegida por RLS e verificação de admin.
 */
export const runDatabaseSeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // 1. Verificar se é admin
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      throw new Error("Acesso negado. Apenas administradores podem executar o seed.");
    }

    const supabase = context.supabase;
    const results: Record<string, number> = {};

    // --- CATEGORIAS ---
    const categories = [
      { slug: "vips", name: "VIPs", description: "Assinaturas com vantagens no servidor.", active: true, position: 1 },
      { slug: "cash", name: "Cash", description: "Moeda da loja para usar em qualquer item.", active: true, position: 2 },
      { slug: "chaves", name: "Chaves", description: "Abra baús com recompensas aleatórias.", active: true, position: 3 },
      { slug: "kits", name: "Kits", description: "Pacotes de itens entregues no jogo.", active: true, position: 4 },
      { slug: "cosmeticos", name: "Cosméticos", description: "Efeitos, capas e partículas.", active: true, position: 5 },
      { slug: "passe", name: "Passe de temporada", description: "Missões e recompensas da temporada.", active: true, position: 6 },
    ];

    for (const cat of categories) {
      await supabase.from("categories").upsert(cat, { onConflict: "slug" });
    }
    results["categories"] = categories.length;

    // Buscar IDs das categorias para vincular produtos
    const { data: dbCats } = await supabase.from("categories").select("id, slug");
    const catMap = Object.fromEntries(dbCats?.map(c => [c.slug, c.id]) || []);

    // --- PRODUTOS ---
    const productList = [
      {
        category_id: catMap["vips"]!,
        slug: "vip-bronze",
        name: "VIP Bronze",
        short_description: "O primeiro passo para quem está começando no Survival.",
        full_description: "Assinatura inicial com kit de boas-vindas, homes extras e cor no chat.",
        price: 19.90,
        duration_days: 30,
        active: true,
        featured: false,
        position: 1
      },
      {
        category_id: catMap["vips"]!,
        slug: "vip-ouro",
        name: "VIP Ouro",
        short_description: "O pacote mais escolhido pela comunidade.",
        full_description: "Kit reforçado, mais homes, acesso antecipado a eventos e fila prioritária.",
        price: 39.90,
        duration_days: 30,
        active: true,
        featured: true,
        position: 2
      },
      {
        category_id: catMap["vips"]!,
        slug: "vip-esmeralda",
        name: "VIP Esmeralda",
        short_description: "Todas as vantagens disponíveis do servidor.",
        full_description: "Nível máximo de assinatura: homes ilimitadas, prefixo exclusivo e cosméticos.",
        price: 69.90,
        duration_days: 30,
        active: true,
        featured: false,
        position: 3
      },
      {
        category_id: catMap["cash"]!,
        slug: "cash-1000",
        name: "1.000 Cash",
        short_description: "Moeda da loja para trocar por qualquer item.",
        price: 9.90,
        active: true,
        position: 4
      },
      {
        category_id: catMap["cash"]!,
        slug: "cash-5000",
        name: "5.000 Cash",
        short_description: "Pacote maior com bônus de crédito.",
        price: 39.90,
        active: true,
        position: 5
      },
      {
        category_id: catMap["chaves"]!,
        slug: "chave-lendaria",
        name: "Chave Lendária",
        short_description: "Chances maiores de itens raros.",
        price: 7.90,
        active: true,
        position: 6
      },
      {
        category_id: catMap["chaves"]!,
        slug: "combo-chaves-lendarias",
        name: "Pacote com 5 Chaves Lendárias",
        short_description: "Leve 5 e pague menos.",
        price: 29.90,
        active: true,
        position: 7
      }
    ];

    for (const prod of productList) {
      await supabase.from("products").upsert(prod, { onConflict: "slug" });
    }
    results["products"] = productList.length;

    // --- MODOS DO SERVIDOR ---
    const modes = [
      { slug: "survival", name: "Survival", description: "Economia, missões, clãs e proteção de terreno.", available: true, position: 1 },
      { slug: "skyblock", name: "SkyBlock", description: "Comece numa ilha flutuante e expanda seu império.", available: false, position: 2 },
      { slug: "rankup", name: "RankUP", description: "Minere, evolua de rank e desbloqueie novas áreas.", available: false, position: 3 },
      { slug: "minigames", name: "Minigames", description: "Partidas rápidas e arenas competitivas.", available: false, position: 4 },
    ];

    for (const mode of modes) {
      await supabase.from("server_modes").upsert(mode, { onConflict: "slug" });
    }
    results["server_modes"] = modes.length;

    // --- STATUS DO SERVIDOR ---
    const status = {
      server_id: "main",
      online: false,
      players_online: 0,
      max_players: 500,
      version: "1.21+",
      ip: "jogar.habbletmine.com.br"
    };
    await supabase.from("server_status").upsert(status, { onConflict: "server_id" });
    results["server_status"] = 1;

    // --- CATEGORIAS DE NOTÍCIAS ---
    const newsCats = [
      { slug: "anuncio", name: "Anúncio" },
      { slug: "modalidade", name: "Modalidade" },
      { slug: "evento", name: "Evento" },
    ];
    for (const nc of newsCats) {
      await supabase.from("news_categories").upsert(nc, { onConflict: "slug" });
    }
    results["news_categories"] = newsCats.length;

    // --- NOTÍCIAS ---
    const { data: dbNewsCats } = await supabase.from("news_categories").select("id, slug");
    const newsCatMap = Object.fromEntries(dbNewsCats?.map(c => [c.slug, c.id]) || []);

    const newsList = [
      {
        category_id: newsCatMap["anuncio"]!,
        slug: "habblet-mine-chegando",
        title: "Habblet Mine está chegando",
        excerpt: "Estamos nos preparativos finais do servidor.",
        content: "Conteúdo completo da inauguração...",
        published: true,
      },
      {
        category_id: newsCatMap["modalidade"]!,
        slug: "conheca-nosso-survival",
        title: "Conheça o nosso Survival",
        excerpt: "Economia equilibrada e proteção de terrenos.",
        content: "Detalhes do modo survival...",
        published: true,
      },
      {
        category_id: newsCatMap["anuncio"]!,
        slug: "inscricoes-beta",
        title: "Inscrições para o beta fechado",
        excerpt: "Venha testar as novidades antes de todo mundo.",
        content: "Formulário de inscrição...",
        published: true,
      }
    ];
    for (const n of newsList) {
      await supabase.from("news").upsert(n, { onConflict: "slug" });
    }
    results["news"] = newsList.length;

    // --- RANKINGS DEMONSTRATIVOS ---
    const rankings = [
      { category: "ricos", minecraft_nickname: "Demo_Player1", value: 1000000, position: 1, period: "weekly" },
      { category: "ricos", minecraft_nickname: "Demo_Player2", value: 500000, position: 2, period: "weekly" },
      { category: "abates", minecraft_nickname: "Demo_Warrior", value: 150, position: 1, period: "weekly" },
    ];
    // Limpar rankings demo antes de inserir (opcional, ou upsert se tivesse UK)
    await supabase.from("rankings").delete().eq("period", "weekly");
    await supabase.from("rankings").insert(rankings);
    results["rankings"] = rankings.length;

    return { success: true, results };
  });
