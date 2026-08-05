import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Page } from "@/lib/types/database";

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data: row, error } = await getPublicServerClient()
      .from("pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error(`[content] getPageBySlug(${data.slug})`, error.message);
      return null;
    }
    return row as Page | null;
  });
