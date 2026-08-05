import { SupabaseClient } from "@supabase/supabase-js";
import { validateMinecraftNickname } from "./minecraft-validator.server";
import { logger } from "../config/logger.server";

import { Database } from "@/integrations/supabase/types";

/**
 * Cria uma preferência de pagamento segura e transacional.
 * REGRAS:
 * - Utiliza process_checkout() RPC para atomicidade total.
 * - Validação financeira ocorre exclusivamente dentro do banco de dados.
 */
export async function createCheckoutRequest(
  data: {
    nickname: string;
    edition: "java" | "bedrock";
    items: { productId: string; quantity: number }[];
    couponCode?: string;
  },
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { getEnv, isProd } = await import("../config/env.server");
  const { getServerFlags } = await import("../config/flags");
  
  const env = getEnv();
  const flags = await getServerFlags();
  
  const MP_ACCESS_TOKEN = env.MERCADOPAGO_ACCESS_TOKEN;
  const APP_URL = env.APP_BASE_URL;
  const IS_PROD = isProd();

  if (!flags.STORE_ENABLED) {
    await logger.warn("checkout", "Tentativa de compra com loja desativada", { userId, context: { data } });
    throw new Error("A loja está temporariamente fechada para manutenção.");
  }

  // 1. Validar Nickname Minecraft
  const mcValidation = await validateMinecraftNickname(data.nickname, data.edition);
  if (!mcValidation.valid) {
    await logger.info("checkout", "Nickname inválido no checkout", { 
      userId, 
      context: { nickname: data.nickname, error: mcValidation.error } 
    });
    throw new Error(`Nickname inválido: ${mcValidation.error}`);
  }

  // Usar o nickname oficial (corrige capitalização)
  const officialNickname = mcValidation.nickname;

  // 2. Chamar RPC Transacional

  const { data: result, error: rpcError } = await supabase.rpc('process_checkout' as any, {
    p_nickname: officialNickname,
    p_edition: data.edition,
    p_items: data.items,
    p_coupon_code: data.couponCode || null
  });

  if (rpcError) {
    await logger.error("checkout", "Falha na RPC process_checkout", rpcError, { userId, context: { data } });
    throw new Error(`Falha técnica no checkout: ${rpcError.message}`);
  }

  const checkoutResult = result as any;
  if (!checkoutResult.success) {
    await logger.warn("checkout", "Checkout rejeitado pela lógica do banco", { 
      userId, 
      context: { error: checkoutResult.error, data } 
    });
    throw new Error(checkoutResult.error || "Erro desconhecido no processamento do pedido.");
  }

  const orderId = checkoutResult.orderId;

  // 2. Integração com Mercado Pago ou Modo Mock
  if (!MP_ACCESS_TOKEN || !flags.REAL_PAYMENTS_ENABLED) {
    await logger.info("checkout", "Checkout concluído em modo MOCK", { orderId, userId });
    if (IS_PROD) {
      await logger.critical("checkout", "Tentativa de checkout MOCK em produção!", { orderId, userId });
      throw new Error("Configuração de pagamento incompleta para produção.");
    }

    return {
      orderId,
      checkoutUrl: `${APP_URL}/sucesso?mock_order_id=${orderId}`,
      isMock: true
    };
  }

  try {
    // 3. Buscar dados do pedido gerado para enviar ao MP (Garante sincronia)
    const { data: orderData } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (!orderData) throw new Error("Pedido não encontrado após criação.");

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: orderData.items.map((item: any) => ({
          title: item.product_name,
          unit_price: Number(item.unit_price),
          quantity: item.quantity,
          currency_id: 'BRL'
        })),
        external_reference: orderId,
        back_urls: {
          success: `${APP_URL}/sucesso`,
          pending: `${APP_URL}/pendente`,
          failure: `${APP_URL}/falha`
        },
        auto_return: 'approved',
        notification_url: `${APP_URL}/api/public/payments/webhook`
      })
    });

    const preference = await response.json();
    
    await logger.info("checkout", "Preferência Mercado Pago gerada", { orderId, userId });
    
    return {
      orderId,
      checkoutUrl: preference.init_point,
      isMock: false
    };
    
    throw new Error("Falha ao gerar preferência no Mercado Pago.");
  } catch (err) {
    await logger.error("checkout", "Erro na integração com Mercado Pago", err, { orderId, userId });
    if (!IS_PROD) {
      return {
        orderId,
        checkoutUrl: `${APP_URL}/sucesso?mock_order_id=${orderId}`,
        isMock: true
      };
    }
    throw new Error("Erro ao processar pagamento. Tente novamente.");
  }
}
