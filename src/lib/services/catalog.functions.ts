/**
 * Serviço de catálogo: categorias e produtos.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Category, ProductWithDetails } from "@/lib/types/database";

export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data, error } = await getPublicServerClient()
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true });

    if (error) {
      console.error("[catalog] listCategories", error.message);
      return [];
    }
    return data ?? [];
  },
);

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        categorySlug: z.string().optional(),
        featuredOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<ProductWithDetails[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    let query = getPublicServerClient()
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug, active),
        benefits:product_benefits(*)
      `)
      .eq("active", true)
      .order("position", { ascending: true });

    if (data.featuredOnly) {
      query = query.eq("featured", true);
    }

    if (data.limit) {
      query = query.limit(data.limit);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error("[catalog] listProducts", error.message);
      return [];
    }

    let result = (rows as unknown as ProductWithDetails[]) ?? [];

    // Filtro de categoria ativa e slug (PostgREST nested filter pode ser chato, filtramos no servidor para segurança)
    result = result.filter(p => p.category && p.category.active);

    if (data.categorySlug) {
      result = result.filter(p => p.category?.slug === data.categorySlug);
    }

    return result;
  });


export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }): Promise<ProductWithDetails | null> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data: row, error } = await getPublicServerClient()
      .from("products")
      .select("*, category:categories(id, name, slug), benefits:product_benefits(*)")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("[catalog] getProductBySlug", error.message);
      return null;
    }
    return (row as unknown as ProductWithDetails) ?? null;
  });
