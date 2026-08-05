import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sistema de Seed Idempotente para o Habblet Mine.
 * 
 * OBJETIVO:
 * Popular o banco com os registros mínimos necessários para substituir os mocks da home e da loja.
 * 
 * REQUISITOS:
 * - Idempotente (upsert baseado em slugs/ids estáveis)
 * - Restrito a administradores
 * - Log de auditoria
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

    const results: Record<string, { inserted: number; updated: number }> = {};

    const trackUpsert = (table: string, count: number) => {
      // Como estamos usando upsert, o Supabase não retorna facilmente o que foi novo vs atualizado 
      // sem um select prévio, então reportamos o total processado.
      results[table] = { inserted: count, updated: 0 };
    };

    // --- CONFIGURAÇÕES DO SITE ---
    const settings = [
      { key: "site_name", value: "Habblet Mine", description: "Nome principal do portal" },
      { key: "server_ip_java", value: "jogar.habbletmine.com.br", description: "IP de conexão Java" },
      { key: "server_ip_bedrock", value: "bedrock.habbletmine.com.br", description: "IP de conexão Bedrock" },
      { key: "server_port_bedrock", value: "19132", description: "Porta Bedrock" },
      { key: "discord_url", value: "https://discord.gg/habblet", description: "Link do Discord" },
      { key: "instagram_url", value: "https://instagram.com/habbletmine", description: "Link do Instagram" },
      { key: "tiktok_url", value: "https://tiktok.com/@habbletmine", description: "Link do TikTok" },
      { key: "youtube_url", value: "https://youtube.com/@habbletmine", description: "Link do YouTube" },
      { key: "support_email", value: "suporte@habbletmine.com.br", description: "Email de contato" },
      { key: "maintenance_mode", value: "false", description: "Estado de manutenção" },
      { key: "store_enabled", value: "true", description: "Habilita compras na loja" },
    ];
    await supabase.from("site_settings").upsert(settings, { onConflict: "key" });
    trackUpsert("site_settings", settings.length);

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
    trackUpsert("categories", categories.length);

    // Mapear IDs das categorias
    const { data: dbCats } = await supabase.from("categories").select("id, slug");
    const catMap = Object.fromEntries(dbCats?.map(c => [c.slug, c.id]) || []);

    // --- PRODUTOS ---
    const products = [
      { category_id: catMap["vips"], slug: "vip-bronze", name: "VIP Bronze", short_description: "Vantagens iniciais essenciais.", price: 19.90, duration_days: 30, active: true, featured: true, position: 1 },
      { category_id: catMap["vips"], slug: "vip-ouro", name: "VIP Ouro", short_description: "O melhor custo-benefício.", price: 39.90, duration_days: 30, active: true, featured: true, position: 2 },
      { category_id: catMap["vips"], slug: "vip-esmeralda", name: "VIP Esmeralda", short_description: "O nível máximo de prestígio.", price: 69.90, duration_days: 30, active: true, featured: true, position: 3 },
      { category_id: catMap["cash"], slug: "cash-1000", name: "1.000 Cash", short_description: "Recarga básica de cash.", price: 9.90, active: true, position: 4 },
      { category_id: catMap["cash"], slug: "cash-5000", name: "5.000 Cash", short_description: "Pacote de cash com bônus.", price: 39.90, active: true, position: 5 },
      { category_id: catMap["chaves"], slug: "chave-lendaria", name: "Chave Lendária", short_description: "Uma unidade da chave rara.", price: 7.90, active: true, position: 6 },
      { category_id: catMap["chaves"], slug: "pacote-5-chaves-lendarias", name: "Combo 5x Chaves Lendárias", short_description: "Economize levando o pacote.", price: 29.90, active: true, position: 7 },
    ];
    
    for (const p of products) {
      await supabase.from("products").upsert(p, { onConflict: "slug" });
    }
    trackUpsert("products", products.length);

    // --- BENEFÍCIOS ---
    const { data: dbProds } = await supabase.from("products").select("id, slug");
    const prodMap = Object.fromEntries(dbProds?.map(p => [p.slug, p.id]) || []);

    const benefits = [
      { product_id: prodMap["vip-bronze"], label: "Prefixo [Bronze] no chat", position: 1 },
      { product_id: prodMap["vip-bronze"], label: "Acesso a 5 homes extras", position: 2 },
      { product_id: prodMap["vip-ouro"], label: "Prefixo [Ouro] no chat", position: 1 },
      { product_id: prodMap["vip-ouro"], label: "Acesso a 15 homes extras", position: 2 },
      { product_id: prodMap["vip-ouro"], label: "Prioridade na fila", position: 3 },
      { product_id: prodMap["vip-esmeralda"], label: "Prefixo [Esmeralda] no chat", position: 1 },
      { product_id: prodMap["vip-esmeralda"], label: "Homes ilimitadas", position: 2 },
      { product_id: prodMap["vip-esmeralda"], label: "Kit Diário Exclusivo", position: 3 },
    ];
    // Limpar benefícios antigos para evitar duplicatas visuais se rodar denovo (como não tem slug única aqui)
    await supabase.from("product_benefits").delete().in("product_id", Object.values(prodMap));
    await supabase.from("product_benefits").insert(benefits);
    trackUpsert("product_benefits", benefits.length);

    // --- MODOS DO SERVIDOR ---
    const modes = [
      { slug: "survival", name: "Survival", description: "Economia, clãs e proteção.", position: 1, available: true },
      { slug: "skyblock", name: "SkyBlock", description: "Desafio na ilha voadora.", position: 2, available: false },
      { slug: "rankup", name: "RankUP", description: "Evolua seu rank minerando.", position: 3, available: false },
      { slug: "minigames", name: "Minigames", description: "Diversão rápida.", position: 4, available: false },
    ];
    await supabase.from("server_modes").upsert(modes, { onConflict: "slug" });
    trackUpsert("server_modes", modes.length);

    // --- STATUS DO SERVIDOR ---
    const serverStatus = {
      server_id: "main",
      name: "Habblet Mine",
      online: false,
      players_online: 0,
      max_players: 500,
      ip: "jogar.habbletmine.com.br",
      version: "1.21+",
      updated_at: new Date().toISOString()
    };
    await supabase.from("server_status").upsert(serverStatus, { onConflict: "server_id" });
    trackUpsert("server_status", 1);

    // --- CATEGORIAS DE NOTÍCIAS ---
    const newsCategories = [
      { slug: "novidades", name: "Novidades" },
      { slug: "atualizacoes", name: "Atualizações" },
      { slug: "eventos", name: "Eventos" },
    ];
    await supabase.from("news_categories").upsert(newsCategories, { onConflict: "slug" });
    trackUpsert("news_categories", newsCategories.length);

    // Mapear IDs de categorias de notícias
    const { data: dbNewsCats } = await supabase.from("news_categories").select("id, slug");
    const newsCatMap = Object.fromEntries(dbNewsCats?.map(nc => [nc.slug, nc.id]) || []);

    // --- NOTÍCIAS ---
    const news = [
      { 
        category_id: newsCatMap["novidades"], 
        slug: "habblet-mine-chegando", 
        title: "Habblet Mine está chegando", 
        excerpt: "O maior servidor brasileiro está em fase final de testes.",
        content: "Prepare-se para uma experiência única...",
        published: true,
        metadata: { is_demo: true }
      },
      { 
        category_id: newsCatMap["novidades"], 
        slug: "conheca-nosso-survival", 
        title: "Conheça o nosso Survival", 
        excerpt: "Economia equilibrada e proteção de terrenos.",
        content: "O modo survival conta com sistemas exclusivos...",
        published: true,
        metadata: { is_demo: true }
      },
      { 
        category_id: newsCatMap["novidades"], 
        slug: "inscricoes-beta-fechado", 
        title: "Inscrições para o beta fechado", 
        excerpt: "Seja um dos primeiros a explorar o mundo.",
        content: "As vagas são limitadas, inscreva-se agora...",
        published: true,
        metadata: { is_demo: true }
      },
    ];
    for (const n of news) {
      await supabase.from("news").upsert(n, { onConflict: "slug" });
    }
    trackUpsert("news", news.length);

    // --- RANKINGS ---
    const rankings = [
      { category: "ricos", minecraft_nickname: "Vini_Player", value: 1500000, position: 1, period: "weekly", metadata: { is_demo: true } },
      { category: "ricos", minecraft_nickname: "Gabs_Mine", value: 900000, position: 2, period: "weekly", metadata: { is_demo: true } },
      { category: "tempo_online", minecraft_nickname: "Hardcore_User", value: 3600, position: 1, period: "weekly", metadata: { is_demo: true } },
      { category: "abates", minecraft_nickname: "Killer_B", value: 450, position: 1, period: "weekly", metadata: { is_demo: true } },
      { category: "votos", minecraft_nickname: "Vote_Master", value: 30, position: 1, period: "weekly", metadata: { is_demo: true } },
    ];
    // Limpar rankings de demonstração semanais para inserir novos
    await supabase.from("rankings").delete().eq("period", "weekly");
    await supabase.from("rankings").insert(rankings);
    trackUpsert("rankings", rankings.length);

    // --- LOG DE AUDITORIA ---
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: "DATABASE_SEED",
      entity_type: "SYSTEM",
      metadata: { results }
    });

    return { success: true, results };
  });
