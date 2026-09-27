/**
 * Contadores de performance em memória. Simples de propósito: pra um
 * serviço rodando numa instância só, isso já dá visibilidade real sem
 * precisar de Prometheus/Grafana. Se um dia crescer pra múltiplas
 * instâncias, essas métricas viram um bom ponto de partida pra migrar.
 */

const inicioProcesso = Date.now();

const estado = {
  totalRequisicoes: 0,
  totalErros: 0,
  somaLatenciaMs: 0,
  latenciasRecentes: [], // últimas N, pra calcular p95 aproximado
  porStatus: {}, // { "2xx": n, "4xx": n, "5xx": n }
};

const MAX_LATENCIAS_GUARDADAS = 500;

export function registrarRequisicao({ statusCode, latenciaMs }) {
  estado.totalRequisicoes += 1;
  estado.somaLatenciaMs += latenciaMs;

  if (statusCode >= 500) estado.totalErros += 1;

  const grupo = `${Math.floor(statusCode / 100)}xx`;
  estado.porStatus[grupo] = (estado.porStatus[grupo] || 0) + 1;

  estado.latenciasRecentes.push(latenciaMs);
  if (estado.latenciasRecentes.length > MAX_LATENCIAS_GUARDADAS) {
    estado.latenciasRecentes.shift();
  }
}

function percentil(valores, p) {
  if (valores.length === 0) return 0;

  const ordenado = [...valores].sort((a, b) => a - b);
  const indice = Math.min(
    ordenado.length - 1,
    Math.floor((p / 100) * ordenado.length)
  );

  return Math.round(ordenado[indice] * 100) / 100;
}

export function coletarMetricas() {
  const uptimeSegundos = (Date.now() - inicioProcesso) / 1000;

  return {
    uptimeSegundos: Math.floor(uptimeSegundos),

    requisicoes: {
      total: estado.totalRequisicoes,
      porStatus: estado.porStatus,
      throughputPorSegundo: uptimeSegundos
        ? Number((estado.totalRequisicoes / uptimeSegundos).toFixed(3))
        : 0,
    },

    latenciaMs: {
      media: estado.totalRequisicoes
        ? Math.round((estado.somaLatenciaMs / estado.totalRequisicoes) * 100) / 100
        : 0,
      p95: percentil(estado.latenciasRecentes, 95),
      p99: percentil(estado.latenciasRecentes, 99),
    },

    taxaErro: estado.totalRequisicoes
      ? Number((estado.totalErros / estado.totalRequisicoes).toFixed(4))
      : 0,

    memoria: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };
}
