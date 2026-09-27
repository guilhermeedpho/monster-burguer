import {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from "../controllers/produtoController.js";
import { exigirAdmin } from "../middlewares/autenticacao.js";

export async function produtoRoutes(app) {
  // Público: é o cardápio que o cliente final vê.
  app.get("/produtos", listarProdutos);
  app.get("/produtos/:id", buscarProduto);

  // Protegido: só quem faz login no admin pode alterar o cardápio.
  app.post("/produtos", { preHandler: exigirAdmin }, criarProduto);
  app.put("/produtos/:id", { preHandler: exigirAdmin }, atualizarProduto);
  app.delete("/produtos/:id", { preHandler: exigirAdmin }, deletarProduto);
}
