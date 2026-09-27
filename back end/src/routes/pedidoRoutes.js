import {
  listarPedidos,
  buscarPedido,
  rastrearPedido,
  criarPedido,
  atualizarStatusPedido,
  deletarPedido,
} from "../controllers/pedidoController.js";

import {
  exigirAutenticacao,
  exigirAdmin,
} from "../middlewares/autenticacao.js";

export async function pedidoRoutes(app) {
  // Público: o cliente final cria o pedido e acompanha pelo código
  // de rastreio (não sequencial) — nunca pelo id interno.
  app.post(
    "/pedidos",
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 minute",
        },
      },
    },
    criarPedido
  );

  app.get("/pedidos/rastrear/:codigo", rastrearPedido);

  // Protegido: lista/consulta interna.
  app.get(
    "/pedidos",
    { preHandler: exigirAutenticacao },
    listarPedidos
  );

  app.get(
    "/pedidos/:id",
    { preHandler: exigirAutenticacao },
    buscarPedido
  );

  // Somente ADMIN pode alterar o status do pedido.
  app.patch(
    "/pedidos/:id/status",
    { preHandler: exigirAdmin },
    atualizarStatusPedido
  );

  // Somente ADMIN pode excluir pedidos.
  app.delete(
    "/pedidos/:id",
    { preHandler: exigirAdmin },
    deletarPedido
  );
}