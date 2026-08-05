/**
 * Serviços públicos do catálogo (leitura como `anon`, respeitando RLS).
 * Somente produtos e categorias ativos são retornados.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Category, ProductWithDetails } from "@/lib/types/database";

const PRODUCT_FIELDS =
  "id, category_id, name, slug, short_description, full_description, price, promotional_price, duration_days, image_url, active, featured, position, created_at, updated_at";

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
        categorySlug: z.string().min(1).max(60).optional(),
        featuredOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(60).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<ProductWithDetails[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    let query = getPublicServerClient()
      .from("products")
      .select(
        `${PRODUCT_FIELDS}, category:categories!inner(id, name, slug), benefits:product_benefits(*)`,
      )
      .eq("active", true)
      .order("position", { ascending: true })
      .limit(data.limit ?? 60);

    if (data.categorySlug) query = query.eq("categories.slug", data.categorySlug);
    if (data.featuredOnly) query = query.eq("featured", true);

    const { data: rows, error } = await query;
    if (error) {
      console.error("[catalog] listProducts", error.message);
      return [];
    }
    return (rows ?? []) as unknown as ProductWithDetails[];
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data }): Promise<ProductWithDetails | null> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data: row, error } = await getPublicServerClient()
      .from("products")
      .select(
        `${PRODUCT_FIELDS}, category:categories(id, name, slug), benefits:product_benefits(*)`,
      )
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("[catalog] getProductBySlug", error.message);
      return null;
    }
    return (row as unknown as ProductWithDetails) ?? null;
  });
