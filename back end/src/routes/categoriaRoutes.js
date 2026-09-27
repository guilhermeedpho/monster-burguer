import {
  listarCategorias,
  buscarCategoria,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
} from "../controllers/categoriaController.js";
import { exigirAutenticacao, exigirAdmin } from "../middlewares/autenticacao.js";

export async function categoriaRoutes(app) {
  app.get("/categorias", listarCategorias);
  app.get("/categorias/:id", buscarCategoria);

  app.post("/categorias", { preHandler: exigirAdmin }, criarCategoria);
  app.put("/categorias/:id", { preHandler: exigirAdmin }, atualizarCategoria);
  app.delete("/categorias/:id", { preHandler: exigirAdmin }, deletarCategoria);
}
