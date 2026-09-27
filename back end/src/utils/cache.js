/**
 * Cache em memória simples, com TTL e contagem de hit/miss.
 * Não precisa de Redis: a API roda em um processo único, então um
 * Map em memória já resolve — e evita bater no banco a cada request
 * de tela pra endpoints que mudam pouco (cardápio, categorias).
 */

const armazenamento = new Map();

export const metricasCache = {
  hits: 0,
  misses: 0,
};

/**
 * Busca no cache; se não tiver (ou tiver expirado), executa `carregar()`,
 * guarda o resultado e devolve.
 */
export async function cachear(chave, ttlMs, carregar) {
  const entrada = armazenamento.get(chave);

  if (entrada && entrada.expiraEm > Date.now()) {
    metricasCache.hits += 1;
    return entrada.valor;
  }

  metricasCache.misses += 1;

  const valor = await carregar();

  armazenamento.set(chave, {
    valor,
    expiraEm: Date.now() + ttlMs,
  });

  return valor;
}

/** Remove uma entrada (ou tudo, se nenhuma chave for passada) do cache. */
export function invalidarCache(chave) {
  if (chave) {
    armazenamento.delete(chave);
  } else {
    armazenamento.clear();
  }
}

export function estatisticasCache() {
  const total = metricasCache.hits + metricasCache.misses;

  return {
    hits: metricasCache.hits,
    misses: metricasCache.misses,
    hitRate: total ? Number((metricasCache.hits / total).toFixed(3)) : 0,
    chavesEmCache: armazenamento.size,
  };
}
