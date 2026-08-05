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
import type { 
  AuditLog, 
  Product, 
  ProductUpdate, 
  Category, 
  ProductCommand,
  ProductBenefit
} from "@/lib/types/database";

const categoryInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().nullable().optional(),
  active: z.boolean().optional(),
  position: z.number().int().optional(),
});

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
  position: z.number().int().optional(),
  compatibility: z.enum(['java', 'bedrock', 'both']).optional(),
  maxQuantity: z.number().int().positive().nullable().optional(),
});

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

// --- Categorias ---

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Category[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("categories")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => categoryInput.parse(input))
  .handler(async ({ data, context }): Promise<Category> => {
    await assertAdmin(context.supabase, context.userId);
    
    const { data: row, error } = await context.supabase
      .from("categories")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image_url: data.imageUrl ?? null,
        active: data.active ?? true,
        position: data.position ?? 0,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "create", "category", row.id, row);
    return row;
  });

export const adminUpdateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => 
    categoryInput.partial().extend({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }): Promise<Category> => {
    await assertAdmin(context.supabase, context.userId);
    
    const { id, ...fields } = data;
    const { data: oldRow } = await context.supabase.from("categories").select("*").eq("id", id).single();

    const { data: row, error } = await context.supabase
      .from("categories")
      .update({
        name: fields.name,
        slug: fields.slug,
        description: fields.description,
        image_url: fields.imageUrl,
        active: fields.active,
        position: fields.position,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "update", "category", id, row, oldRow);
    return row;
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    // Verificar dependências
    const { count } = await context.supabase
      .from("products")
      .select("*", { count: 'exact', head: true })
      .eq("category_id", data.id);
    
    if (count && count > 0) {
      throw new Error("Não é possível excluir uma categoria que possui produtos vinculados. Arquive-a em vez disso.");
    }

    const { data: oldRow } = await context.supabase.from("categories").select("*").eq("id", data.id).single();
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "delete", "category", data.id, null, oldRow);
    return { success: true };
  });

// --- Produtos ---

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ 
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    limit: z.number().int().optional(),
    offset: z.number().int().optional()
  }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    let query = context.supabase
      .from("products")
      .select("*, category:categories(name)", { count: 'exact' });
    
    if (data.search) {
      query = query.ilike("name", `%${data.search}%`);
    }
    if (data.categoryId) {
      query = query.eq("category_id", data.categoryId);
    }
    
    const limit = data.limit ?? 50;
    const offset = data.offset ?? 0;
    
    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return { products: rows ?? [], count: count ?? 0 };
  });

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }): Promise<Product> => {
    await assertAdmin(context.supabase, context.userId);

    // Validação extra
    if (data.promotionalPrice !== null && data.promotionalPrice !== undefined && data.promotionalPrice >= data.price) {
      throw new Error("O preço promocional deve ser menor que o preço original.");
    }

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
        position: data.position ?? 0,
        compatibility: data.compatibility ?? 'both',
        max_quantity: data.maxQuantity ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao criar o produto: ${error.message}`);
    await logAudit(context.supabase, context.userId, "create", "product", row.id, row);
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
    
    // Validação extra de preço
    if (fields.price !== undefined && fields.promotionalPrice !== undefined) {
      if (fields.promotionalPrice !== null && fields.promotionalPrice >= fields.price) {
        throw new Error("O preço promocional deve ser menor que o preço original.");
      }
    }

    const { data: oldRow } = await context.supabase.from("products").select("*").eq("id", id).single();

    const patch: ProductUpdate = {};
    if (fields.categoryId !== undefined) patch.category_id = fields.categoryId;
    if (fields.name !== undefined) patch.name = fields.name;
    if (fields.slug !== undefined) patch.slug = fields.slug;
    if (fields.shortDescription !== undefined)
      patch.short_description = fields.shortDescription;
    if (fields.fullDescription !== undefined)
      patch.full_description = fields.fullDescription;
    if (fields.price !== undefined) patch.price = fields.price;
    if (fields.promotionalPrice !== undefined)
      patch.promotional_price = fields.promotionalPrice;
    if (fields.durationDays !== undefined) patch.duration_days = fields.durationDays;
    if (fields.imageUrl !== undefined) patch.image_url = fields.imageUrl;
    if (fields.active !== undefined) patch.active = fields.active;
    if (fields.featured !== undefined) patch.featured = fields.featured;
    if (fields.position !== undefined) patch.position = fields.position;
    if (fields.compatibility !== undefined) patch.compatibility = fields.compatibility;
    if (fields.maxQuantity !== undefined) patch.max_quantity = fields.maxQuantity;

    const { data: row, error } = await context.supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao atualizar o produto: ${error.message}`);
    await logAudit(context.supabase, context.userId, "update", "product", id, row, oldRow);
    return row;
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    // Verificar se possui pedidos (exclusão lógica se houver pedidos)
    const { count } = await context.supabase
      .from("order_items")
      .select("*", { count: 'exact', head: true })
      .eq("product_id", data.id);
    
    if (count && count > 0) {
      // Exclusão lógica (desativar)
      await context.supabase.from("products").update({ active: false }).eq("id", data.id);
      throw new Error("Produto com pedidos vinculados foi desativado em vez de excluído fisicamente.");
    }

    const { data: oldRow } = await context.supabase.from("products").select("*").eq("id", data.id).single();
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "delete", "product", data.id, null, oldRow);
    return { success: true };
  });

// --- Comandos de Produto ---

const BLOCKED_COMMANDS = ['op ', 'deop ', 'stop', 'restart', 'reload', 'whitelist off'];

const commandSchema = z.object({
  template: z.string().trim().min(1).refine(val => {
    return !BLOCKED_COMMANDS.some(blocked => val.toLowerCase().startsWith(blocked));
  }, { message: "O comando contém termos restritos ou perigosos." }),
  server_id: z.string().trim().optional().nullable(),
  run_on: z.enum(['payment', 'delivery', 'expiration', 'refund']).default('payment'),
});

export const adminListProductCommands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<ProductCommand[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("product_commands")
      .select("*")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: true });
    
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveProductCommands = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ 
    productId: z.string().uuid(),
    commands: z.array(commandSchema)
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    // Transação simples: deletar atuais e inserir novos
    const { error: delError } = await context.supabase
      .from("product_commands")
      .delete()
      .eq("product_id", data.productId);
    
    if (delError) throw new Error(delError.message);
    
    if (data.commands.length > 0) {
      const { error: insError } = await context.supabase
        .from("product_commands")
        .insert(data.commands.map(cmd => ({
          ...cmd,
          product_id: data.productId
        })));
        
      if (insError) throw new Error(insError.message);
    }

    await logAudit(context.supabase, context.userId, "update_commands", "product", data.productId, data.commands);
    return { success: true };
  });

// --- Benefícios de Produto ---

export const adminSaveProductBenefits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ 
    productId: z.string().uuid(),
    benefits: z.array(z.string().trim().min(1))
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    
    // Deletar atuais
    await context.supabase.from("product_benefits").delete().eq("product_id", data.productId);
    
    if (data.benefits.length > 0) {
      await context.supabase.from("product_benefits").insert(data.benefits.map(benefit => ({
        product_id: data.productId,
        benefit
      })));
    }

    await logAudit(context.supabase, context.userId, "update_benefits", "product", data.productId, data.benefits);
    return { success: true };
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
