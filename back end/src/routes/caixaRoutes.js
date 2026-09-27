import { adicionarMovimentacao, abrirCaixa, caixaAberto, fecharCaixa, historicoCaixas } from "../controllers/caixaController.js";
import { exigirAutenticacao, exigirAdmin } from "../middlewares/autenticacao.js";

export async function caixaRoutes(app) {
  app.get("/caixa/atual", { preHandler: exigirAutenticacao }, caixaAberto);
  app.get("/caixa/historico", { preHandler: exigirAutenticacao }, historicoCaixas);
  app.post("/caixa/abrir", { preHandler: exigirAdmin }, abrirCaixa);
  app.post("/caixa/:id/movimentacoes", { preHandler: exigirAdmin }, adicionarMovimentacao);
  app.post("/caixa/:id/fechar", { preHandler: exigirAdmin }, fecharCaixa);
}
