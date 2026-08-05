/**
 * Conteúdo público: notícias, rankings, status do servidor, modalidades e
 * configurações marcadas como públicas.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  News,
  NewsCategory,
  Ranking,
  ServerMode,
  ServerStatus,
  SiteSetting,
} from "@/lib/types/database";

export const listPublishedNews = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(30).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<(News & { category: NewsCategory | null })[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data: rows, error } = await getPublicServerClient()
      .from("news")
      .select("*, category:news_categories(*)")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(data.limit ?? 10);

    if (error) {
      console.error("[content] listPublishedNews", error.message);
      return [];
    }
    return (rows ?? []) as unknown as (News & { category: NewsCategory | null })[];
  });

export const getNewsBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }): Promise<News | null> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data: row, error } = await getPublicServerClient()
      .from("news")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("[content] getNewsBySlug", error.message);
      return null;
    }
    return row ?? null;
  });

export const listRankings = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        category: z.string().min(1).max(40),
        period: z.string().min(1).max(20).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<Ranking[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data: rows, error } = await getPublicServerClient()
      .from("rankings")
      .select("*")
      .eq("category", data.category)
      .eq("period", data.period ?? "weekly")
      .order("position", { ascending: true })
      .limit(data.limit ?? 10);

    if (error) {
      console.error("[content] listRankings", error.message);
      return [];
    }
    return rows ?? [];
  });

export const getServerStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerStatus | null> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data, error } = await getPublicServerClient()
      .from("server_status")
      .select("*")
      .eq("server_id", "main")
      .maybeSingle();

    if (error) {
      console.error("[content] getServerStatus", error.message);
      return null;
    }
    return data ?? null;
  },
);

export const listServerModes = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerMode[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data, error } = await getPublicServerClient()
      .from("server_modes")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("[content] listServerModes", error.message);
      return [];
    }
    return data ?? [];
  },
);

export const listPublicSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSetting[]> => {
    const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
    const { data, error } = await getPublicServerClient()
      .from("site_settings")
      .select("*")
      .eq("is_public", true);

    if (error) {
      console.error("[content] listPublicSettings", error.message);
      return [];
    }
    return data ?? [];
  },
);
