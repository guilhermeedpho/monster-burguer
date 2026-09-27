import { uploadImagem } from "../controllers/uploadController.js";
import { exigirAdmin } from "../middlewares/autenticacao.js";

export async function uploadRoutes(app) {
  app.post(
    "/upload",
    {
      preHandler: exigirAdmin,
      // Limite mais apertado que o resto da API — upload de imagem é
      // mais pesado (banda/disco) que uma requisição JSON comum.
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },
    },
    uploadImagem
  );
}
