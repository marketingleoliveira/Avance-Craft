import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sistema de Seed Idempotente para o Habblet Mine.
 */
export const runDatabaseSeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1. Verificar se é admin
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin" as any,
    });

    if (roleError || !isAdmin) {
      throw new Error("Acesso negado. Apenas administradores podem executar o seed.");
    }

    const results: Record<string, { total: number }> = {};

    // --- CONFIGURAÇÕES DO SITE ---
    const settings = [
      { key: "site_name", value: "Habblet Mine" },
      { key: "server_ip_java", value: "jogar.habbletmine.com.br" },
      { key: "server_ip_bedrock", value: "bedrock.habbletmine.com.br" },
      { key: "server_port_bedrock", value: "19132" },
      { key: "discord_url", value: "https://discord.gg/habblet" },
      { key: "instagram_url", value: "https://instagram.com/habbletmine" },
      { key: "tiktok_url", value: "https://tiktok.com/@habbletmine" },
      { key: "youtube_url", value: "https://youtube.com/@habbletmine" },
      { key: "support_email", value: "suporte@habbletmine.com.br" },
      { key: "maintenance_mode", value: "false" },
      { key: "store_enabled", value: "true" },
    ];
    await supabase.from("site_settings").upsert(settings, { onConflict: "key" });
    results["site_settings"] = { total: settings.length };

    // --- CATEGORIAS ---
    const categories = [
      { slug: "vips", name: "VIPs", description: "Assinaturas com vantagens exclusivas.", position: 1, active: true },
      { slug: "cash", name: "Cash", description: "Moeda virtual para itens diversos.", position: 2, active: true },
      { slug: "chaves", name: "Chaves", description: "Abra baús misteriosos.", position: 3, active: true },
      { slug: "kits", name: "Kits", description: "Pacotes de itens para o jogo.", position: 4, active: true },
      { slug: "cosmeticos", name: "Cosméticos", description: "Efeitos e itens visuais.", position: 5, active: true },
      { slug: "passe-temporada", name: "Passe de Temporada", description: "Recompensas por progresso.", position: 6, active: true },
    ];
    await supabase.from("categories").upsert(categories, { onConflict: "slug" });
    results["categories"] = { total: categories.length };

    // Mapear IDs das categorias
    const { data: dbCats } = await supabase.from("categories").select("id, slug");
    const catMap = Object.fromEntries(dbCats?.map(c => [c.slug, c.id]) || []);

    // --- PRODUTOS ---
    const products: any[] = [
      { category_id: catMap["vips"]!, slug: "vip-bronze", name: "VIP Bronze", short_description: "Vantagens iniciais essenciais.", price: 19.90, duration_days: 30, active: true, featured: true, position: 1 },
      { category_id: catMap["vips"]!, slug: "vip-ouro", name: "VIP Ouro", short_description: "O melhor custo-benefício.", price: 39.90, duration_days: 30, active: true, featured: true, position: 2 },
      { category_id: catMap["vips"]!, slug: "vip-esmeralda", name: "VIP Esmeralda", short_description: "O nível máximo de prestígio.", price: 69.90, duration_days: 30, active: true, featured: true, position: 3 },
      { category_id: catMap["cash"]!, slug: "cash-1000", name: "1.000 Cash", short_description: "Recarga básica de cash.", price: 9.90, active: true, position: 4 },
      { category_id: catMap["cash"]!, slug: "cash-5000", name: "5.000 Cash", short_description: "Pacote de cash com bônus.", price: 39.90, active: true, position: 5 },
      { category_id: catMap["chaves"]!, slug: "chave-lendaria", name: "Chave Lendária", short_description: "Uma unidade da chave rara.", price: 7.90, active: true, position: 6 },
      { category_id: catMap["chaves"]!, slug: "pacote-5-chaves-lendarias", name: "Combo 5x Chaves Lendárias", short_description: "Economize levando o pacote.", price: 29.90, active: true, position: 7 },
    ];
    
    for (const p of products) {
      await supabase.from("products").upsert(p, { onConflict: "slug" });
    }
    results["products"] = { total: products.length };

    // Mapear IDs dos produtos
    const { data: dbProds } = await supabase.from("products").select("id, slug");
    const prodMap = Object.fromEntries(dbProds?.map(p => [p.slug, p.id]) || []);

    // --- BENEFÍCIOS ---
    const benefits: any[] = [
      { product_id: prodMap["vip-bronze"]!, label: "Prefixo [Bronze] no chat", position: 1 },
      { product_id: prodMap["vip-bronze"]!, label: "Acesso a 5 homes extras", position: 2 },
      { product_id: prodMap["vip-ouro"]!, label: "Prefixo [Ouro] chat", position: 1 },
      { product_id: prodMap["vip-ouro"]!, label: "Acesso a 15 homes extras", position: 2 },
      { product_id: prodMap["vip-ouro"]!, label: "Prioridade na fila", position: 3 },
      { product_id: prodMap["vip-esmeralda"]!, label: "Prefixo [Esmeralda] chat", position: 1 },
      { product_id: prodMap["vip-esmeralda"]!, label: "Homes ilimitadas", position: 2 },
      { product_id: prodMap["vip-esmeralda"]!, label: "Kit Diário Exclusivo", position: 3 },
    ];
    await supabase.from("product_benefits").delete().in("product_id", Object.values(prodMap));
    await supabase.from("product_benefits").insert(benefits);
    results["product_benefits"] = { total: benefits.length };

    // --- MODOS DO SERVIDOR ---
    const modes = [
      { slug: "survival", name: "Survival", description: "Economia, clãs e proteção.", position: 1, available: true },
      { slug: "skyblock", name: "SkyBlock", description: "Desafio na ilha voadora.", position: 2, available: false },
      { slug: "rankup", name: "RankUP", description: "Evolua seu rank minerando.", position: 3, available: false },
      { slug: "minigames", name: "Minigames", description: "Diversão rápida.", position: 4, available: false },
    ];
    await supabase.from("server_modes").upsert(modes, { onConflict: "slug" });
    results["server_modes"] = { total: modes.length };

    // --- STATUS DO SERVIDOR ---
    const serverStatus: any = {
      server_id: "main",
      online: false,
      players_online: 0,
      max_players: 500,
      ip: "jogar.habbletmine.com.br",
      version: "1.21+",
    };
    await supabase.from("server_status").upsert(serverStatus, { onConflict: "server_id" });
    results["server_status"] = { total: 1 };

    // --- CATEGORIAS DE NOTÍCIAS ---
    const newsCategories = [
      { slug: "novidades", name: "Novidades" },
      { slug: "atualizacoes", name: "Atualizações" },
      { slug: "eventos", name: "Eventos" },
    ];
    await supabase.from("news_categories").upsert(newsCategories, { onConflict: "slug" });
    results["news_categories"] = { total: newsCategories.length };

    const { data: dbNewsCats } = await supabase.from("news_categories").select("id, slug");
    const newsCatMap = Object.fromEntries(dbNewsCats?.map(nc => [nc.slug, nc.id]) || []);

    // --- NOTÍCIAS ---
    const news: any[] = [
      { 
        category_id: newsCatMap["novidades"]!, 
        slug: "habblet-mine-chegando", 
        title: "Habblet Mine está chegando", 
        excerpt: "O maior servidor brasileiro está em fase final de testes.",
        content: "Prepare-se para uma experiência única...",
        published: true,
      },
      { 
        category_id: newsCatMap["novidades"]!, 
        slug: "conheca-no-survival", 
        title: "Conheça o nosso Survival", 
        excerpt: "Economia equilibrada e proteção de terrenos.",
        content: "O modo survival conta com sistemas exclusivos...",
        published: true,
      },
      { 
        category_id: newsCatMap["novidades"]!, 
        slug: "inscricoes-beta-fechado", 
        title: "Inscrições para o beta fechado", 
        excerpt: "Seja um dos primeiros a explorar o mundo.",
        content: "As vagas são limitadas, inscreva-se agora...",
        published: true,
      },
    ];
    for (const n of news) {
      await supabase.from("news").upsert(n, { onConflict: "slug" });
    }
    results["news"] = { total: news.length };

    // --- RANKINGS ---
    const rankings: any[] = [
      { category: "ricos", minecraft_nickname: "Vini_Player", value: 1500000, position: 1, period: "weekly" },
      { category: "ricos", minecraft_nickname: "Gabs_Mine", value: 900000, position: 2, period: "weekly" },
      { category: "tempo_online", minecraft_nickname: "Hardcore_User", value: 3600, position: 1, period: "weekly" },
      { category: "abates", minecraft_nickname: "Killer_B", value: 450, position: 1, period: "weekly" },
      { category: "votos", minecraft_nickname: "Vote_Master", value: 30, position: 1, period: "weekly" },
    ];
    await supabase.from("rankings").delete().eq("period", "weekly");
    await supabase.from("rankings").insert(rankings);
    results["rankings"] = { total: rankings.length };

    // --- LOG DE AUDITORIA ---
    await supabase.from("audit_logs").insert({
      actor_profile_id: null, // Sistema
      action: "DATABASE_SEED",
      entity: "SYSTEM",
      metadata: results as any
    });

    return { success: true, results };
  });
