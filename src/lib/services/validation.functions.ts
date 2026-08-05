import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin.functions";

/**
 * Cria o produto de validação real controlado.
 * Restrito apenas a administradores.
 */
export const createValidationProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAdmin(context.supabase, context.userId);

    // 1. Garantir que a categoria "Sistema" ou "Interno" existe
    let { data: category } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", "interno")
      .maybeSingle();

    if (!category) {
      const { data: newCat, error: catErr } = await supabaseAdmin
        .from("categories")
        .insert({
          name: "Interno",
          slug: "interno",
          active: false, // Oculto da loja pública
          position: 999
        } as any)
        .select("id")
        .single();
      
      if (catErr) throw new Error("Falha ao criar categoria interna");
      category = newCat;
    }

    // 2. Criar o produto de validação (R$ 1,00 ou mínimo MP)
    const { data: product, error: prodErr } = await supabaseAdmin
      .from("products")
      .upsert({
        category_id: (category as any).id,
        name: "Validação de Entrega (Real)",
        slug: "validacao-entrega-real",
        short_description: "Produto de teste real para validação de checkout e plugin.",
        price: 1.00,
        active: false, // Não aparece na vitrine
        featured: false,
        position: 0
      } as any, { onConflict: "slug" })
      .select("id")
      .single();

    if (prodErr) throw new Error("Falha ao criar produto de validação");

    // 3. Adicionar comando seguro (exemplo: dar 1 terra para o jogador)
    await supabaseAdmin
      .from("product_commands")
      .delete()
      .eq("product_id", (product as any).id);

    await supabaseAdmin
      .from("product_commands")
      .insert({
        product_id: (product as any).id,
        command: "give {nickname} minecraft:dirt 1",
        run_on: "payment"
      } as any);

    return { productId: (product as any).id };
  });
