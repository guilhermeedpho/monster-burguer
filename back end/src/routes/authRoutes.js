import { login, bootstrap, criarUsuario, eu } from "../controllers/authController.js";
import { exigirAutenticacao, exigirAdmin } from "../middlewares/autenticacao.js";

export async function authRoutes(app) {
  app.post(
    "/auth/login",
    {
      // Trava força bruta: só 8 tentativas por minuto por IP nesse endpoint.
      config: {
        rateLimit: {
          max: 8,
          timeWindow: "1 minute",
        },
      },
    },
    login
  );

  app.post(
    "/auth/bootstrap",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    bootstrap
  );

  app.post("/auth/usuarios", { preHandler: exigirAdmin }, criarUsuario);

  app.get("/auth/eu", { preHandler: exigirAutenticacao }, eu);
}
