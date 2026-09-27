import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

/**
 * Cabeçalhos de segurança padrão (Content-Security-Policy,
 * X-Frame-Options, X-Content-Type-Options, etc). Como essa API só
 * serve JSON (não HTML), a CSP fica restritiva por padrão.
 */
export async function registrarHelmet(app) {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  });
}

/**
 * Rate limit global, evita abuso/força-bruta contra a API.
 * Rotas de escrita (POST/PUT/PATCH/DELETE) podem receber um limite
 * mais apertado quando registradas com { config: { rateLimit } }.
 */
export async function registrarRateLimit(app) {
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
    errorResponseBuilder: (request, context) => ({
      erro: `Muitas requisições. Tente novamente em ${Math.ceil(
        context.after / 1000
      )} segundos.`,
      requestId: request.id,
    }),
  });
}

/**
 * Remove espaços extras de todo campo string enviado no corpo da
 * requisição, antes de o Zod validar. Ajuda a evitar que espaços em
 * branco disfarcem campos "vazios" (ex.: nome = "   ").
 */
export function registrarSanitizacaoDeInput(app) {
  app.addHook("preValidation", async (request) => {
    if (request.body && typeof request.body === "object") {
      sanitizarObjeto(request.body);
    }
  });
}

function sanitizarObjeto(obj) {
  for (const chave of Object.keys(obj)) {
    const valor = obj[chave];

    if (typeof valor === "string") {
      obj[chave] = valor.trim();
    } else if (valor && typeof valor === "object" && !Array.isArray(valor)) {
      sanitizarObjeto(valor);
    } else if (Array.isArray(valor)) {
      valor.forEach((item) => {
        if (item && typeof item === "object") sanitizarObjeto(item);
      });
    }
  }
}
