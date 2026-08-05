import { z } from "zod";

export interface MinecraftValidationResult {
  valid: boolean;
  nickname: string;
  uuid?: string;
  error?: string;
  source: 'mojang' | 'format' | 'cache';
}

const JAVA_NICK_REGEX = /^[a-zA-Z0-9_]{3,16}$/;
// Bedrock nicks podem ter espaços e até 16-20 caracteres dependendo da plataforma
const BEDROCK_NICK_REGEX = /^[a-zA-Z0-9_ ]{3,20}$/;

// Cache simples em memória (Server-side)
const validationCache = new Map<string, { result: MinecraftValidationResult, expires: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

/**
 * Valida um nickname Minecraft.
 * Para Java, consulta a API da Mojang.
 * Para Bedrock, valida o formato.
 */
export async function validateMinecraftNickname(
  nickname: string,
  edition: 'java' | 'bedrock'
): Promise<MinecraftValidationResult> {
  const cleanNick = nickname.trim();
  const cacheKey = `${edition}:${cleanNick.toLowerCase()}`;

  // 1. Verificar Cache
  const cached = validationCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return { ...cached.result, source: 'cache' };
  }

  // 2. Validação básica de formato
  if (edition === 'java') {
    if (!JAVA_NICK_REGEX.test(cleanNick)) {
      return { valid: false, nickname: cleanNick, error: "Formato de nick Java inválido (3-16 caracteres, sem espaços).", source: 'format' };
    }

    try {
      // Consultar API oficial da Mojang
      const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${cleanNick}`);
      
      if (response.status === 204 || response.status === 404) {
        return { valid: false, nickname: cleanNick, error: "Jogador Java não encontrado na base da Mojang.", source: 'mojang' };
      }

      if (!response.ok) {
        // Se a API da Mojang estiver fora, aceitamos o formato mas avisamos
        console.warn(`[Minecraft Auth] Mojang API returned ${response.status} for ${cleanNick}`);
        return { valid: true, nickname: cleanNick, source: 'format' };
      }

      const data = await response.json();
      const result: MinecraftValidationResult = {
        valid: true,
        nickname: data.name,
        uuid: data.id,
        source: 'mojang'
      };

      // Salvar no cache
      validationCache.set(cacheKey, { result, expires: Date.now() + CACHE_TTL });
      return result;

    } catch (err) {
      console.error("[Minecraft Auth] Erro ao consultar Mojang API:", err);
      // Fallback para validação de formato se a rede falhar
      return { valid: true, nickname: cleanNick, source: 'format' };
    }
  } else {
    // Bedrock Edition
    if (!BEDROCK_NICK_REGEX.test(cleanNick)) {
      return { valid: false, nickname: cleanNick, error: "Formato de nick Bedrock inválido.", source: 'format' };
    }

    const result: MinecraftValidationResult = {
      valid: true,
      nickname: cleanNick,
      source: 'format'
    };

    validationCache.set(cacheKey, { result, expires: Date.now() + CACHE_TTL });
    return result;
  }
}
