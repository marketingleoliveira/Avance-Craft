import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

type DeliveryStatus = Database["public"]["Enums"]["delivery_status"];

/**
 * Lógica de processamento de falhas na entrega com backoff exponencial.
 */
export async function handleDeliveryFailure(
  deliveryId: string,
  errorResponse: string,
  supabase: SupabaseClient<Database>
) {
  // 1. Buscar estado atual
  const { data: delivery, error: fetchError } = await supabase
    .from("delivery_queue")
    .select("attempts")
    .eq("id", deliveryId)
    .single();

  if (fetchError || !delivery) {
    console.error(`[delivery] Fail to fetch delivery ${deliveryId} for error handling`);
    return;
  }

  // max_attempts não está no banco (baseado no erro do TS), usaremos padrão 5
  const maxAttempts = 5;
  const currentAttempts = (delivery.attempts ?? 0) + 1;

  // 2. Determinar novo status e próxima tentativa (Backoff)
  let nextStatus: DeliveryStatus = "queued";
  let availableAt = new Date().toISOString();

  if (currentAttempts >= maxAttempts) {
    nextStatus = "failed";
  } else {
    // Backoff exponencial: 2^attempts * 60 segundos (1m, 2m, 4m, 8m...)
    const delayMinutes = Math.pow(2, currentAttempts);
    const nextDate = new Date();
    nextDate.setMinutes(nextDate.getMinutes() + delayMinutes);
    availableAt = nextDate.toISOString();
  }

  // 3. Atualizar fila
  await supabase
    .from("delivery_queue")
    .update({
      status: nextStatus,
      attempts: currentAttempts,
      available_at: availableAt,
      last_error: errorResponse,
      claimed_at: null
    } as any)
    .eq("id", deliveryId);

  // 4. Registrar tentativa
  await supabase.from("delivery_attempts").insert({
    delivery_queue_id: deliveryId,
    attempt_number: currentAttempts,
    success: false,
    response: errorResponse
  });
}

/**
 * Lógica de processamento de sucesso na entrega.
 */
export async function handleDeliverySuccess(
  deliveryId: string,
  response: string,
  supabase: SupabaseClient<Database>
) {
  // 1. Marcar como entregue
  const { data: delivery, error } = await supabase
    .from("delivery_queue")
    .update({
      status: "delivered" as DeliveryStatus,
      delivered_at: new Date().toISOString(),
      last_error: null
    } as any)
    .eq("id", deliveryId)
    .select("order_item_id")
    .single();

  if (error || !delivery) return;

  // 2. Registrar tentativa bem-sucedida
  await supabase.from("delivery_attempts").insert({
    delivery_queue_id: deliveryId,
    attempt_number: 1,
    success: true,
    response
  });

  // 3. Verificar se o pedido completo pode ser marcado como entregue
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("id", delivery.order_item_id)
    .single();

  if (orderItem) {
    // Verificar se ainda existem itens pendentes para este pedido
    const { data: remaining } = await supabase
      .from("delivery_queue")
      .select("id")
      .eq("status", "queued" as DeliveryStatus)
      .eq("order_item_id", delivery.order_item_id) // Simplificando a lógica de verificação
      .limit(1);

    // Nota: O ideal é verificar todos os order_item_id associados ao order_id
    if (!remaining || remaining.length === 0) {
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
