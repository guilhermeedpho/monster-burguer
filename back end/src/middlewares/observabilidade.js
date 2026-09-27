import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { registrarRequisicao, coletarMetricas } from "../utils/metricas.js";
import { redigir } from "../utils/redacao.js";

let ultimoAlertaEm = 0;
const INTERVALO_MINIMO_ENTRE_ALERTAS_MS = 60_000; // no máximo 1 alerta por minuto, pra não floodar

/**
 * Alertas configuráveis (item 9): se a taxa de erro passar do limite
 * configurado, loga um alerta crítico e, se ALERT_WEBHOOK_URL estiver
 * definida no .env, envia um POST pra esse webhook (compatível com
 * Slack/Discord, que aceitam { text: "..." }).
 *
 * Desligado por padrão — só age se houver requisições suficientes pra
 * a métrica fazer sentido, e respeita um intervalo mínimo entre alertas.
 */
async function verificarAlertas(app) {
  const limite = Number(process.env.ALERT_ERROR_RATE_THRESHOLD || 0.2);
  const minimoRequisicoes = 20;

  const metricas = coletarMetricas();

  if (metricas.requisicoes.total < minimoRequisicoes) return;
  if (metricas.taxaErro < limite) return;
  if (Date.now() - ultimoAlertaEm < INTERVALO_MINIMO_ENTRE_ALERTAS_MS) return;

  ultimoAlertaEm = Date.now();

  const mensagem = `[ALERTA] Taxa de erro em ${(metricas.taxaErro * 100).toFixed(
    1
  )}% (limite: ${(limite * 100).toFixed(1)}%) — ${metricas.requisicoes.total} requisições.`;

  app.log.fatal({ metricas }, mensagem);

  const webhook = process.env.ALERT_WEBHOOK_URL;
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: mensagem }),
    });
  } catch (erro) {
    app.log.error({ err: erro.message }, "falha ao enviar alerta pro webhook");
  }
}

/**
 * Gera um Request ID único por requisição.
 * O Fastify já usa isso automaticamente em app.log (todo log fica com { reqId }).
 */
export function gerarRequestId(req) {
  return req.headers["x-request-id"] || randomUUID();
}

/**
 * Registra o Request ID no header de resposta, pra quem chamou a API
 * conseguir citar esse ID caso precise abrir um chamado/relatar um bug.
 */
export function registrarRequestIdNaResposta(app) {
  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    return payload;
  });
}

/**
 * Log estruturado (JSON) de toda requisição concluída: método, rota,
 * status, tempo de resposta e request id. O pino (logger do Fastify)
 * já loga isso automaticamente, mas aqui garantimos um resumo único
 * e fácil de filtrar por reqId.
 */
export function registrarLogDeRequisicoes(app) {
  app.addHook("onRequest", async (request) => {
    request.tempoInicioNs = process.hrtime.bigint();
  });

  app.addHook("onResponse", async (request, reply) => {
    const responseTimeMs = request.tempoInicioNs
      ? Number(process.hrtime.bigint() - request.tempoInicioNs) / 1e6
      : undefined;

    const responseTimeArredondado =
      responseTimeMs !== undefined
        ? Math.round(responseTimeMs * 100) / 100
        : 0;

    request.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs: responseTimeArredondado,
      },
      "requisição concluída"
    );

    registrarRequisicao({
      statusCode: reply.statusCode,
      latenciaMs: responseTimeArredondado,
    });

    verificarAlertas(app);
  });
}

/**
 * Tratamento de erro centralizado: qualquer erro não tratado nos
 * controllers cai aqui. Loga a stack trace completa no servidor
 * (nunca no cliente) e devolve uma resposta padronizada com o
 * request id, pra facilitar rastrear o problema depois.
 */
export function registrarTratadorDeErros(app) {
  app.setErrorHandler((error, request, reply) => {
    // Erros de validação do Zod -> 400 com detalhes dos campos
    if (error instanceof ZodError) {
      request.log.warn(
        { reqId: request.id, issues: error.issues },
        "erro de validação"
      );

      return reply.code(400).send({
        erro: "Dados inválidos.",
        detalhes: error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        })),
        requestId: request.id,
      });
    }

    // Erros do Prisma (ex.: violação de constraint única)
    if (error.code === "P2002") {
      request.log.warn(
        { reqId: request.id, campos: error.meta?.target },
        "violação de restrição única"
      );

      return reply.code(409).send({
        erro: "Já existe um registro com esses dados.",
        campos: error.meta?.target,
        requestId: request.id,
      });
    }

    if (error.code === "P2025") {
      return reply.code(404).send({
        erro: "Registro não encontrado.",
        requestId: request.id,
      });
    }

    if (error.code === "P2003") {
      return reply.code(400).send({
        erro: "Referência inválida (ex.: categoria ou produto inexistente).",
        campo: error.meta?.field_name,
        requestId: request.id,
      });
    }

    const statusCode = error.statusCode || 500;

    // Loga a stack trace completa no servidor, com contexto da requisição
    request.log.error(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        body: redigir(request.body),
        err: {
          message: error.message,
          stack: error.stack,
        },
      },
      "erro não tratado"
    );

    return reply.code(statusCode).send({
      erro:
        statusCode >= 500
          ? "Erro interno do servidor."
          : error.message,
      requestId: request.id,
    });
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.code(404).send({
      erro: `Rota ${request.method} ${request.url} não encontrada.`,
      requestId: request.id,
    });
  });
}
