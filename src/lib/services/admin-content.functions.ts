import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { 
  AuditLog,
  News,
  NewsCategory
} from "@/lib/types/database";

/** Contrato mínimo necessário para checar o papel do chamador via RLS. */
type RoleChecker = {
  rpc: (
    fn: "has_role",
    args: { _user_id: string; _role: "admin" },
  ) => PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
};

type AuthedSupabase = RoleChecker;

async function assertAdmin(supabase: AuthedSupabase, userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`Falha ao validar permissões: ${error.message}`);
  if (!data) throw new Error("Acesso restrito a administradores.");
}

async function logAudit(
  supabase: any, 
  userId: string, 
  action: string, 
  entityType: string, 
  entityId: string, 
  newData: any = null, 
  oldData: any = null
) {
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    new_data: newData,
    old_data: oldData
  });
}

// --- Notícias ---

const newsCategoryInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  active: z.boolean().optional(),
});

const newsInput = z.object({
  title: z.string().trim().min(5).max(120),
  slug: z
    .string()
    .trim()
    .min(5)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  summary: z.string().trim().max(300).nullable().optional(),
  content: z.string().trim().min(10),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).default('draft'),
  publishedAt: z.string().nullable().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  featured: z.boolean().optional(),
  position: z.number().int().optional(),
});

export const adminListNewsCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsCategory[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("news_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateNewsCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => newsCategoryInput.parse(input))
  .handler(async ({ data, context }): Promise<NewsCategory> => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("news_categories")
      .insert({
        name: data.name,
        slug: data.slug,
        active: data.active ?? true,
      } as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "create", "news_category", row.id, row);
    return row;
  });

export const adminListNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    limit: z.number().int().optional(),
    offset: z.number().int().optional()
  }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const limit = data.limit ?? 50;
    const offset = data.offset ?? 0;
    const { data: rows, count, error } = await context.supabase
      .from("news")
      .select("*, category:news_categories(name)", { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(error.message);
    return { news: rows ?? [], count: count ?? 0 };
  });

export const adminCreateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => newsInput.parse(input))
  .handler(async ({ data, context }): Promise<News> => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("news")
      .insert({
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        image_url: data.imageUrl,
        category_id: data.categoryId,
        status: data.status,
        published_at: data.publishedAt || (data.status === 'published' ? new Date().toISOString() : null),
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        featured: data.featured ?? false,
        position: data.position ?? 0,
        author_id: context.userId,
        published: data.status === 'published' // Mapeamento para a coluna booleana do schema real
      } as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "create", "news", row.id, row);
    return row;
  });

export const adminUpdateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => 
    newsInput.partial().extend({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }): Promise<News> => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...fields } = data;
    const { data: oldRow } = await context.supabase.from("news").select("*").eq("id", id).single();
    
    const patch: any = {
      ...fields,
      image_url: fields.imageUrl,
      category_id: fields.categoryId,
      seo_title: fields.seoTitle,
      seo_description: fields.seoDescription,
      published_at: fields.publishedAt,
    };
    
    if (fields.status === 'published') {
      patch.published = true;
      if (!oldRow.published_at) patch.published_at = new Date().toISOString();
    } else if (fields.status === 'draft' || fields.status === 'archived') {
      patch.published = false;
    }

    const { data: row, error } = await context.supabase
      .from("news")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
      
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "update", "news", id, row, oldRow);
    return row;
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: oldRow } = await context.supabase.from("news").select("*").eq("id", data.id).single();
    const { error } = await context.supabase.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "delete", "news", data.id, null, oldRow);
    return { success: true };
  });

