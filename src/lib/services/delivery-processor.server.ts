import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

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
    .select("attempts, max_attempts")
    .eq("id", deliveryId)
    .single();

  const maxAttempts = (delivery as any)?.max_attempts ?? 5;
  const currentAttempts = (delivery?.attempts ?? 0) + 1;

  if (fetchError || !delivery) {
    console.error(`[delivery] Fail to fetch delivery ${deliveryId} for error handling`);
    return;
  }

  // 2. Determinar novo status e próxima tentativa (Backoff)
  let nextStatus: "queued" | "failed" = "queued";
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
      status: nextStatus as any,
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
      status: "delivered",
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
    attempt_number: 1, // Sucesso limpa o histórico conceitualmente ou marca a última
    success: true,
    response
  });

  // 3. Verificar se o pedido completo pode ser marcado como entregue
  // Buscamos todos os itens do pedido original
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("id", delivery.order_item_id)
    .single();

  if (orderItem) {
    const { data: remaining } = await supabase
      .from("delivery_queue")
      .select("id")
      .eq("status", "queued")
      .filter("order_item_id", "in", 
        supabase.from("order_items").select("id").eq("order_id", orderItem.order_id)
      )
      .limit(1);

    if (!remaining || remaining.length === 0) {
      await supabase
        .from("orders")
        .update({ 
          status: "delivered", 
          delivered_at: new Date().toISOString() 
        })
        .eq("id", orderItem.order_id)
        .eq("status", "paid"); // Só entrega se estiver pago
    }
  }
}
