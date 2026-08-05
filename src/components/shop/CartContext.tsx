import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { validateCouponPublic } from "@/lib/services/admin-coupons.functions";
import { useServerFn } from "@tanstack/react-start";

import type { Platform } from "@/lib/payments/checkout-service";

export type CartLine = { 
  productId: string; 
  quantity: number; 
  /** @deprecated Dados para exibição local, servidor valida preços */
  product?: any 
};


type CartContextValue = {
  nickname: string;
  setNickname: (value: string) => void;
  platform: Platform;
  setPlatform: (value: Platform) => void;
  confirmed: boolean;
  setConfirmed: (value: boolean) => void;
  lines: CartLine[];
  detailed: { product: any; quantity: number }[];
  add: (productId: string, quantity?: number, productData?: any) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  coupon: string;
  setCoupon: (value: string) => void;
  appliedCoupon: string | null;
  applyCoupon: () => Promise<boolean>;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [nickname, setNicknameState] = useState("");
  const [platform, setPlatformState] = useState<Platform>("java");
  const [confirmed, setConfirmed] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountCents, setDiscountCents] = useState(0);
  const validateCoupon = useServerFn(validateCouponPublic);

  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
    setConfirmed(false);
  }, []);
  const setPlatform = useCallback((value: Platform) => {
    setPlatformState(value);
    setConfirmed(false);
  }, []);

  const add = useCallback((productId: string, quantity = 1, productData?: any) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.min(99, line.quantity + quantity) }
            : line,
        );
      }
      return [...prev, { productId, quantity, product: productData }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((line) => line.productId !== productId)
        : prev.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(99, quantity) }
              : line,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setAppliedCoupon(null);
    setCoupon("");
  }, []);

  const applyCoupon = useCallback(async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon(null);
      setDiscountCents(0);
      return false;
    }

    try {
      const result = await validateCoupon({ data: { code, subtotalCents } });
      if (result.valid) {
        setAppliedCoupon(code);
        setDiscountCents(result.discountCents);
        return true;
      }
      setAppliedCoupon(null);
      setDiscountCents(0);
      return false;
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setAppliedCoupon(null);
      setDiscountCents(0);
      return false;
    }
  }, [coupon, subtotalCents, validateCoupon]);

  const detailed = useMemo(
    () => lines.filter(l => !!l.product).map(l => ({ product: l.product as any, quantity: l.quantity })),
    [lines],
  );


  const subtotalCents = useMemo(
    () => detailed.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0),
    [detailed],
  );
  // Desconto agora vem do estado atualizado via applyCoupon
  // No caso de mudança no subtotal (ex: remover item), invalidamos o cupom por segurança
  // ou poderíamos revalidar automaticamente. Aqui limpamos para forçar nova aplicação.
  useMemo(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setDiscountCents(0);
    }
  }, [lines]);

  const value: CartContextValue = {
    nickname,
    setNickname,
    platform,
    setPlatform,
    confirmed,
    setConfirmed,
    lines,
    detailed,
    add,
    setQuantity,
    remove,
    clear,
    coupon,
    setCoupon,
    appliedCoupon,
    applyCoupon,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    count: detailed.reduce((sum, item) => sum + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de <CartProvider>.");
  return context;
}
