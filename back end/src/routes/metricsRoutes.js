import { coletarMetricas } from "../utils/metricas.js";
import { estatisticasCache } from "../utils/cache.js";
import { exigirAdmin } from "../middlewares/autenticacao.js";

export async function metricsRoutes(app) {
  app.get("/metrics", { preHandler: exigirAdmin }, async () => {
    return {
      ...coletarMetricas(),
      cache: estatisticasCache(),
      timestamp: new Date().toISOString(),
    };
  });
}
