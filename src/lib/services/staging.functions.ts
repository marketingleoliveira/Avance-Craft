import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isStaging, isDev } from "@/lib/config/env.server";
import { assertAdmin } from "@/lib/services/admin.functions";
import { z } from "zod";

/**
 * Seed exclusivo para ambiente de Staging.
 * Cria produtos de teste e categorias simuladas.
 */
export const runStagingSeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    // Segurança: Impedir execução acidental em Produção
    if (!isStaging() && !isDev()) {
      throw new Error("O seed de staging só pode ser executado em ambientes de Staging ou Desenvolvimento.");
    }

    const results = [];

    // 1. Categoria de Teste (tabela 'categories' no plural)
    const { data: cat, error: catErr } = await context.supabase
      .from("categories")
      .upsert({ 
        name: "Produtos de Teste", 
        slug: "teste", 
        description: "Categoria exclusiva para testes de staging", 
        active: true 
      }, { onConflict: 'slug' })
      .select()
      .single();
    
    if (catErr) throw new Error(`Erro ao criar categoria: ${catErr.message}`);
    results.push("Categoria 'Produtos de Teste' pronta.");

    // 2. Produtos de Teste (VIP R$ 1,00 para sandbox)
    const testProducts = [
      {
        name: "VIP Teste (R$ 1,00)",
        slug: "vip-teste-staging",
        short_description: "Produto para teste de checkout real em sandbox.",
        price: 1.00,
        category_id: cat.id,
        active: true,
      },
      {
        name: "Cash Teste",
        slug: "cash-teste-staging",
        short_description: "Créditos virtuais para teste.",
        price: 5.00,
        category_id: cat.id,
        active: true,
      }
    ];

    for (const p of testProducts) {
      const { error: pErr } = await context.supabase
        .from("products")
        .upsert(p, { onConflict: 'slug' });
      
      if (pErr) results.push(`Erro no produto ${p.slug}: ${pErr.message}`);
      else results.push(`Produto ${p.name} pronto.`);
    }

    return { success: true, log: results };
  });

/**
 * Limpa dados transacionais de Staging.
 */
export const clearStagingData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ confirm: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    if (!isStaging() && !isDev()) {
      throw new Error("A limpeza de dados transacionais é proibida em Produção.");
    }

    if (!data.confirm) throw new Error("Confirmação necessária.");

    const tables = ["delivery_queue", "orders", "payments", "support_messages", "support_tickets"];
    const results: Record<string, number> = {};

    for (const table of tables as any[]) {
      const { error, count } = await context.supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Deleta tudo
      
      if (error) throw new Error(`Erro ao limpar ${table}: ${error.message}`);
      results[table] = count ?? 0;
    }

    // Log de Auditoria
    await context.supabase.from("audit_logs").insert({
      actor_profile_id: context.userId,
      action: "clear_staging_data",
      entity: "system",
      metadata: { results } as any
    });

    return { success: true, results };
  });
