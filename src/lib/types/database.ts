/**
 * Tipos de domínio do Habblet Mine derivados do schema do banco.
 * Fonte única de verdade: `src/integrations/supabase/types.ts` (gerado).
 */
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type AppRole = Enums<"app_role">;
export type MinecraftEdition = Enums<"minecraft_edition">;
export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;
export type DeliveryStatus = Enums<"delivery_status">;
export type TicketStatus = Enums<"ticket_status">;

export type Profile = Tables<"profiles">;
export type UserRole = Tables<"user_roles">;
export type PlayerAccount = Tables<"player_accounts">;
export type PlayerAccountInsert = TablesInsert<"player_accounts">;

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;
export type ProductBenefit = Tables<"product_benefits">;
export type ProductCommand = Tables<"product_commands">;

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Payment = Tables<"payments">;
export type Coupon = Tables<"coupons">;
export type CouponUse = Tables<"coupon_uses">;

export type News = Tables<"news">;
export type NewsCategory = Tables<"news_categories">;
export type Ranking = Tables<"rankings">;
export type ServerStatus = Tables<"server_status">;
export type ServerMode = Tables<"server_modes">;

export type SupportTicket = Tables<"support_tickets">;
export type SupportMessage = Tables<"support_messages">;
export type AuditLog = Tables<"audit_logs">;
export type SiteSetting = Tables<"site_settings">;

/** Produto com os relacionamentos usados na vitrine da loja. */
export type ProductWithDetails = Product & {
  category: Pick<Category, "id" | "name" | "slug" | "active"> | null;
  benefits: ProductBenefit[];
};


/** Pedido com itens — usado no perfil do jogador. */
export type OrderWithItems = Order & { items: OrderItem[] };
