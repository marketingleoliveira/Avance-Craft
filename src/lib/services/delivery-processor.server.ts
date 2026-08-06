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
  const { error } = await supabase.rpc("fail_delivery", {
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

  // Buscar o item do pedido associado para verificar se o pedido completo foi entregue
  const { data: delivery } = await supabase
    .from("delivery_queue")
    .select("order_item_id")
    .eq("id", deliveryId)
    .single();

  if (delivery?.order_item_id) {
    // Buscar o order_id a partir do order_item
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("id", delivery.order_item_id)
      .single();

    if (orderItem?.order_id) {
      // Verificar se ainda existem itens não entregues para este pedido na delivery_queue
      // Como não temos order_id direto na delivery_queue, buscamos por todos os order_item_id do pedido
      const { data: siblings } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", orderItem.order_id);

      if (siblings && siblings.length > 0) {
        const siblingIds = siblings.map(s => s.id);
        
        const { count } = await supabase
          .from("delivery_queue")
          .select("*", { count: 'exact', head: true })
          .in("order_item_id", siblingIds)
          .neq("status", "delivered" as any);

        if (count === 0) {
          await supabase
            .from("orders")
            .update({ 
              status: "delivered", 
              delivered_at: new Date().toISOString() 
            })
            .eq("id", orderItem.order_id)
            .eq("status", "paid");
        }
      }
    }
  }
}
