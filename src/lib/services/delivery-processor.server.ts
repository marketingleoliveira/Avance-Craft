import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

/**
 * Lógica de processamento de falhas na entrega usando RPC atômica.
 */
export async function handleDeliveryFailure(
  deliveryId: string,
  errorResponse: string,
  supabase: SupabaseClient<Database>
) {
  const { data, error } = await supabase.rpc("fail_delivery", {
    _delivery_id: deliveryId,
    _error_code: "PLUGIN_ERROR",
    _error_message: errorResponse,
    _response_payload: { raw: errorResponse }
  });

  if (error) {
    console.error(`[delivery] Fail to execute fail_delivery RPC for ${deliveryId}:`, error);
  }
}

/**
 * Lógica de processamento de sucesso na entrega usando RPC atômica.
 */
export async function handleDeliverySuccess(
  deliveryId: string,
  response: string,
  supabase: SupabaseClient<Database>
) {
  const { data: success, error } = await supabase.rpc("confirm_delivery", {
    _delivery_id: deliveryId,
    _response_payload: { raw: response }
  });

  if (error || !success) {
    console.error(`[delivery] Fail to execute confirm_delivery RPC for ${deliveryId}:`, error);
    return;
  }

  // Lógica adicional: atualizar pedido se necessário
  // A RPC já marca como delivered, mas a orquestração do status do pedido (order)
  // pode ser feita aqui ou via triggers no DB.
  
  // Buscar o order_id associado para verificar se o pedido completo foi entregue
  const { data: delivery } = await supabase
    .from("delivery_queue")
    .select("order_id, order_item_id")
    .eq("id", deliveryId)
    .single();

  if (delivery?.order_id) {
    // Verificar se ainda existem itens não entregues para este pedido
    const { count } = await supabase
      .from("delivery_queue")
      .select("*", { count: 'exact', head: true })
      .eq("order_id", delivery.order_id)
      .neq("status", "delivered" as any);

    if (count === 0) {
      await supabase
        .from("orders")
        .update({ 
          status: "delivered", 
          delivered_at: new Date().toISOString() 
        })
        .eq("id", delivery.order_id)
        .eq("status", "paid");
    }
  }
}
