/**
 * Serviços administrativos.
 *
 * Toda função verifica o papel do chamador com `has_role` através do cliente
 * autenticado (RLS aplica). Nenhuma operação usa service role para decidir
 * autorização, e a fila de entrega continua inacessível ao frontend.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { AuditLog, Product } from "@/lib/types/database";

const productInput = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  shortDescription: z.string().trim().max(280).optional(),
  fullDescription: z.string().trim().max(8000).optional(),
  price: z.number().nonnegative(),
  promotionalPrice: z.number().nonnegative().nullable().optional(),
  durationDays: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

async function assertAdmin(
  supabase: Parameters<typeof Object.keys>[0] extends never ? never : any,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`Falha ao validar permissões: ${error.message}`);
  if (!data) throw new Error("Acesso restrito a administradores.");
}

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }): Promise<Product> => {
    await assertAdmin(context.supabase, context.userId);

    const { data: row, error } = await context.supabase
      .from("products")
      .insert({
        category_id: data.categoryId,
        name: data.name,
        slug: data.slug,
        short_description: data.shortDescription ?? null,
        full_description: data.fullDescription ?? null,
        price: data.price,
        promotional_price: data.promotionalPrice ?? null,
        duration_days: data.durationDays ?? null,
        image_url: data.imageUrl ?? null,
        active: data.active ?? true,
        featured: data.featured ?? false,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao criar o produto: ${error.message}`);
    return row;
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    productInput.partial().extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Product> => {
    await assertAdmin(context.supabase, context.userId);

    const { id, ...fields } = data;
    const patch: Record<string, unknown> = {};
    if (fields.categoryId !== undefined) patch["category_id"] = fields.categoryId;
    if (fields.name !== undefined) patch["name"] = fields.name;
    if (fields.slug !== undefined) patch["slug"] = fields.slug;
    if (fields.shortDescription !== undefined)
      patch["short_description"] = fields.shortDescription;
    if (fields.fullDescription !== undefined)
      patch["full_description"] = fields.fullDescription;
    if (fields.price !== undefined) patch["price"] = fields.price;
    if (fields.promotionalPrice !== undefined)
      patch["promotional_price"] = fields.promotionalPrice;
    if (fields.durationDays !== undefined) patch["duration_days"] = fields.durationDays;
    if (fields.imageUrl !== undefined) patch["image_url"] = fields.imageUrl;
    if (fields.active !== undefined) patch["active"] = fields.active;
    if (fields.featured !== undefined) patch["featured"] = fields.featured;

    const { data: row, error } = await context.supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao atualizar o produto: ${error.message}`);
    return row;
  });

export const adminListAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(200).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<AuditLog[]> => {
    await assertAdmin(context.supabase, context.userId);

    const { data: rows, error } = await context.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);

    if (error) throw new Error(`Falha ao carregar os registros: ${error.message}`);
    return rows ?? [];
  });
