/**
 * CAMADA DE SERVIÇO DE PAGAMENTO (mock).
 *
 * Nenhuma chave de pagamento pode viver no frontend. Quando o Mercado Pago for
 * habilitado, a implementação real deve apenas chamar um server function que
 * cria a preferência de pagamento no backend e devolve a URL de checkout.
 *
 * Contrato pensado para o Mercado Pago Checkout Pro:
 *   POST (server) -> preference { items, payer, external_reference }
 *   resposta      -> { init_point: string }
 */

export type Platform = "java" | "bedrock";

export type CheckoutItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type CheckoutRequest = {
  nickname: string;
  platform: Platform;
  items: CheckoutItem[];
  coupon?: string;
  totalCents: number;
};

export type CheckoutResult =
  | { status: "unavailable"; message: string }
  | { status: "redirect"; url: string };

/**
 * Implementação mockada: NÃO processa pagamento e NÃO chama API externa.
 * Trocar pelo server function de criação de preferência quando o backend existir.
 */
export async function createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
  if (!request.nickname.trim()) {
    return { status: "unavailable", message: "Informe seu nick antes de continuar." };
  }
  if (request.items.length === 0) {
    return { status: "unavailable", message: "Seu carrinho está vazio." };
  }
  return {
    status: "unavailable",
    message:
      "Pagamentos ainda não estão habilitados. Esta loja é demonstrativa e nenhuma cobrança é feita.",
  };
}

/** Regras de validação de nick por plataforma. */
export function validateNickname(nickname: string, platform: Platform): string | null {
  const value = nickname.trim();
  if (!value) return "Informe o seu nick.";
  if (platform === "java") {
    if (!/^[A-Za-z0-9_]{3,16}$/.test(value)) {
      return "Nick Java: 3 a 16 caracteres, apenas letras, números e _.";
    }
    return null;
  }
  if (value.length < 3 || value.length > 24) {
    return "Gamertag Bedrock: entre 3 e 24 caracteres.";
  }
  if (!/^[A-Za-z0-9 _.-]+$/.test(value)) {
    return "Gamertag Bedrock: use letras, números, espaço, ponto, hífen ou _.";
  }
  return null;
}
