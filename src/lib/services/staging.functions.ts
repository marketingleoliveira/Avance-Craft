import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isStaging, isDev } from "@/lib/config/env.server";
import { assertAdmin } from "@/lib/services/admin.functions";
import { z } from "zod";

/**
 * Seed exclusivo para ambiente de Staging.
 * Cria produtos de teste, categorias e usuários simulados.
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

    // 1. Categorias de Teste
    const { data: cat, error: catErr } = await context.supabase
      .from("product_categories")
      .upsert([
        { name: "Produtos de Teste", slug: "teste", description: "Categoria exclusiva para testes de staging", active: true }
      ], { onConflict: 'slug' })
      .select()
      .single();
    
    if (catErr) throw new Error(`Erro ao criar categoria: ${catErr.message}`);
    results.push("Categoria 'Produtos de Teste' criada/atualizada.");

    // 2. Produtos de Teste (VIP R$ 1,00 para sandbox)
    const testProducts = [
      {
        name: "VIP Teste (R$ 1,00)",
        slug: "vip-teste-staging",
        description: "Produto para teste de checkout real em sandbox.",
        price: 1.00,
        category_id: cat.id,
        active: true,
        type: 'rank',
        commands: ["lp user {player} parent add test_vip"],
        metadata: { staging: true }
      },
      {
        name: "Cash Teste",
        slug: "cash-teste-staging",
        description: "Créditos virtuais para teste.",
        price: 5.00,
        category_id: cat.id,
        active: true,
        type: 'currency',
        commands: ["eco give {player} 1000"],
        metadata: { staging: true }
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
 * Útil para resetar o ambiente antes de novos ciclos de QA.
 */
export const clearStagingData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ confirm: z.boolean() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    if (!isStaging() && !isDev()) {
      throw new Error("A limpeza de dados transacionais é proibida em Produção.");
    }

    if (!data.confirm) throw new Error("Confirmação necessária.");

    const tables = ["delivery_queue", "orders", "payments", "support_ticket_messages", "support_tickets"];
    const results: Record<string, number> = {};

    for (const table of tables) {
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
      metadata: { results }
    });

    return { success: true, results };
  });
