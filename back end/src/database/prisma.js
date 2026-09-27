import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

// Query logging estruturado (JSON)
const logarQueries =
  process.env.NODE_ENV !== "production" ||
  process.env.LOG_QUERIES === "true";

if (logarQueries) {
  prisma.$on("query", (evento) => {
    let quantidadeParametros = 0;

    try {
      quantidadeParametros = JSON.parse(evento.params || "[]").length;
    } catch {
      // Alguns parâmetros podem conter JSON interno.
      // Se não for possível interpretar, não derruba o servidor.
      quantidadeParametros = -1;
    }

    console.log(
      JSON.stringify({
        nivel: "debug",
        tipo: "prisma-query",
        query: evento.query,

        // Não registra os valores dos parâmetros.
        quantidadeParametros,

        duracaoMs: evento.duration,
        timestamp: new Date().toISOString(),
      })
    );
  });
}

prisma.$on("warn", (evento) => {
  console.warn(
    JSON.stringify({
      nivel: "warn",
      tipo: "prisma-warn",
      mensagem: evento.message,
    })
  );
});

prisma.$on("error", (evento) => {
  console.error(
    JSON.stringify({
      nivel: "error",
      tipo: "prisma-error",
      mensagem: evento.message,
    })
  );
});