import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import jwt from "@fastify/jwt";
import { randomUUID } from "node:crypto";

import { iniciarSocket } from "./socket/socket.js";
import { UPLOADS_DIR } from "./utils/caminhoUploads.js";

import { produtoRoutes } from "./routes/produtoRoutes.js";
import { categoriaRoutes } from "./routes/categoriaRoutes.js";
import { clienteRoutes } from "./routes/clienteRoutes.js";
import { pedidoRoutes } from "./routes/pedidoRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { caixaRoutes } from "./routes/caixaRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { metricsRoutes } from "./routes/metricsRoutes.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";

import { registrarHelmet, registrarRateLimit, registrarSanitizacaoDeInput } from "./middlewares/seguranca.js";
import {
  registrarRequestIdNaResposta,
  registrarLogDeRequisicoes,
  registrarTratadorDeErros,
} from "./middlewares/observabilidade.js";

// Em produção, defina FRONTEND_URL no .env com o domínio real do front-end.
// Em desenvolvimento, aceita as portas padrão do Vite.
const origensPermitidas = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
    ];

// Em produção, JWT_SECRET é obrigatório — sem ele, qualquer token seria
// assinado com um segredo previsível e o login não protegeria nada.
let jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "ERRO FATAL: defina JWT_SECRET no .env antes de rodar em produção."
    );
    process.exit(1);
  }

  jwtSecret = randomUUID() + randomUUID();
  console.warn(
    "AVISO: JWT_SECRET não definido — usando um valor temporário só para " +
      "desenvolvimento. Todos os logins são invalidados a cada reinício. " +
      "Defina JWT_SECRET no .env antes de ir para produção."
  );
}

const app = Fastify({
  logger: true,
  // Request ID único por requisição (fica disponível em request.id e
  // aparece automaticamente em todo log gerado durante a requisição).
  genReqId: (req) => req.headers["x-request-id"] || randomUUID(),
  trustProxy: process.env.TRUST_PROXY === "true",
});

const start = async () => {
  try {
    // Segurança
    await registrarHelmet(app);
    await registrarRateLimit(app);
    registrarSanitizacaoDeInput(app);

    await app.register(cors, {
      origin: origensPermitidas,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });

    await app.register(jwt, { secret: jwtSecret });

    // Upload de imagens: aceita multipart/form-data e serve os arquivos
    // salvos em /uploads/<nome>. As imagens precisam poder ser carregadas
    // por qualquer origem (o front pode estar em outro domínio em produção),
    // por isso o Cross-Origin-Resource-Policy é liberado só pra essa pasta.
    await app.register(multipart, {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    });

    await app.register(fastifyStatic, {
      root: UPLOADS_DIR,
      prefix: "/uploads/",
      setHeaders: (res) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    });

    // Observabilidade
    registrarRequestIdNaResposta(app);
    registrarLogDeRequisicoes(app);
    registrarTratadorDeErros(app);

    // Rotas
    await app.register(healthRoutes);
    await app.register(metricsRoutes);
    await app.register(authRoutes);
    await app.register(produtoRoutes);
    await app.register(categoriaRoutes);
    await app.register(clienteRoutes);
    await app.register(pedidoRoutes);
    await app.register(dashboardRoutes);
    await app.register(caixaRoutes);
    await app.register(uploadRoutes);

    app.get("/", async () => {
      return {
        projeto: "Monster Burguer",
        versao: "1.0.0",
        status: "API funcionando",
      };
    });

    // Inicia o servidor Fastify
    await app.listen({
      port: process.env.PORT || 3000,
      host: "0.0.0.0",
    });

    // Inicializa o Socket.IO usando o servidor HTTP do Fastify
    iniciarSocket(app.server, origensPermitidas, async (token) => app.jwt.verify(token));

    console.log("Servidor rodando em http://localhost:3000");
    console.log("Socket.IO iniciado com sucesso!");
    console.log(`CORS liberado para: ${origensPermitidas.join(", ")}`);

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
