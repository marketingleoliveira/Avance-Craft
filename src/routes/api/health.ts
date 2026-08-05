import { createFileRoute } from '@tanstack/react-router'
import { getHealthStatus } from '@/lib/services/health.functions'

/**
 * Rota de API para Healthcheck (Docker/Hostinger)
 * Mapeia o server function getHealthStatus para um endpoint HTTP GET.
 */
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const result = await getHealthStatus();
          // Se for uma Response (erro 503 do handler), retorna ela diretamente
          if (result instanceof Response) return result;
          
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ status: 'error', error: error.message }), {
            status: 500
          });
        }
      }
    }
  }
})
