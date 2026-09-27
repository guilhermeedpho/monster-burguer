import { prisma } from "../database/prisma.js";

export async function healthRoutes(app) {
  app.get("/health", async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true, servico: "monster-burguer-api" };
    } catch {
      reply.code(503);
      return { ok: false, servico: "monster-burguer-api" };
    }
  });
}
