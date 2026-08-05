/**
 * Pedidos e pagamentos — somente leitura do próprio histórico.
 *
 * A criação de pedidos, a mudança de status e a fila de entrega acontecem
 * exclusivamente no servidor (checkout + webhook do provedor). O jogador nunca
 * pode alterar o próprio status de pagamento.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type {
  Order,
  OrderWithItems,
  Payment,
  PlayerAccount,
  Profile,
} from "@/lib/types/database";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile | null> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(`Falha ao carregar o perfil: ${error.message}`);
    return data ?? null;
  });

export const listMyPlayerAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlayerAccount[]> => {
    const { data, error } = await context.supabase
      .from("player_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Falha ao carregar as contas: ${error.message}`);
    return data ?? [];
  });

/** Vincula um nick ao perfil autenticado. O `profile_id` vem do token, nunca do cliente. */
export const addMyPlayerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        minecraftNickname: z.string().trim().min(3).max(24),
        edition: z.enum(["java", "bedrock"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<PlayerAccount> => {
    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (profileError || !profile) throw new Error("Perfil não encontrado.");

    if (data.edition === "java" && !/^[A-Za-z0-9_]{3,16}$/.test(data.minecraftNickname)) {
      throw new Error("Nick Java inválido: 3 a 16 caracteres (letras, números e _).");
    }

    const { data: row, error } = await context.supabase
      .from("player_accounts")
      .insert({
        profile_id: profile.id,
        minecraft_nickname: data.minecraftNickname,
        edition: data.edition,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Falha ao vincular o nick: ${error.message}`);
    return row;
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OrderWithItems[]> => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(`Falha ao carregar os pedidos: ${error.message}`);
    return (data ?? []) as unknown as OrderWithItems[];
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(
    async ({ data, context }): Promise<(OrderWithItems & { payments: Payment[] }) | null> => {
      const { data: row, error } = await context.supabase
        .from("orders")
        .select("*, items:order_items(*), payments:payments(*)")
        .eq("id", data.orderId)
        .maybeSingle();

      if (error) throw new Error(`Falha ao carregar o pedido: ${error.message}`);
      return (row as unknown as OrderWithItems & { payments: Payment[] }) ?? null;
    },
  );

export type { Order };
