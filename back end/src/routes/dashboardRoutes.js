import { dashboard } from "../controllers/dashboardController.js";
import { exigirAutenticacao } from "../middlewares/autenticacao.js";

export async function dashboardRoutes(app) {
  app.get("/dashboard", { preHandler: exigirAutenticacao }, dashboard);
}
