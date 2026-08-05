import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Endpoint de saúde do sistema para Docker/K8s.
 * Verifica a conectividade básica com o banco de dados.
 */
export const getHealthStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getPublicServerClient } = await import("@/lib/supabase/public-client.server");
      const supabase = getPublicServerClient();
      
      const { error } = await supabase.from("site_settings").select("key").limit(1);
      
      if (error) throw error;
      
      return { 
        status: "ok", 
        timestamp: new Date().toISOString(),
        service: "habblet-mine-frontend"
      };
    } catch (err: any) {
      return new Response(JSON.stringify({ 
        status: "error", 
        message: err.message 
      }), { status: 503 });
    }
  });
