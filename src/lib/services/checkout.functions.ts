import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createCheckoutRequest } from "./checkout.server";

export const createPaymentPreference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        nickname: z.string().min(3).max(24),
        edition: z.enum(["java", "bedrock"]),
        items: z.array(
          z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().min(1).max(99),
          })
        ),
        couponCode: z.string().nullish(),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    return createCheckoutRequest(
      {
        nickname: data.nickname,
        edition: data.edition,
        items: data.items,
        couponCode: (data.couponCode as string) || undefined,
      },
      context.supabase,
      context.userId
    );
  });
