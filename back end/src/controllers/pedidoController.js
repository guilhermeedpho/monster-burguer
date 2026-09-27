import * as pedidoService from "../services/pedidoService.js";
import { z } from "zod";

// Listar pedidos
export async function listarPedidos(request, reply) {
  return await pedidoService.listarPedidos();
}

// Buscar pedido por ID (uso administrativo)
export async function buscarPedido(request, reply) {
  const { id } = request.params;

  const pedido = await pedidoService.buscarPedido(id);

  if (!pedido) {
    return reply.code(404).send({
      erro: "Pedido não encontrado.",
      requestId: request.id,
    });
  }

  return pedido;
}

/** Busca pública pelo código de rastreio (tela de acompanhamento do cliente). */
export async function rastrearPedido(request, reply) {
  const { codigo } = request.params;

  const pedido = await pedidoService.buscarPedidoPorCodigo(codigo);

  if (!pedido) {
    return reply.code(404).send({
      erro: "Pedido não encontrado.",
      requestId: request.id,
    });
  }

  return pedido;
}

const pedidoSchema = z.object({
  clienteId: z.number().int().positive(),

  formaPagamento: z.enum(["PIX", "DINHEIRO", "CREDITO", "DEBITO"]),

  tipoEntrega: z.enum(["BALCAO", "RETIRADA", "DELIVERY"]),

  // Valores monetários: nunca negativos, e com um teto de sanidade
  // pra evitar que um valor absurdo (proposital ou por bug) derrube o pedido.
  trocoPara: z.number().min(0).max(100000).optional(),

  desconto: z.number().min(0).max(100000).optional(),

  taxaEntrega: z.number().min(0).max(1000).optional(),

  observacao: z.string().max(500).optional(),

  itens: z
    .array(
      z.object({
        produtoId: z.number().int().positive(),
        quantidade: z.number().int().positive().max(50),
        opcaoPonto: z.string().max(50).optional(),
        observacao: z.string().max(300).optional(),
        adicionaisIds: z.array(z.number().int().positive()).max(20).optional(),
      })
    )
    .min(1, "O pedido precisa ter ao menos um item."),
});

// Criar pedido
export async function criarPedido(request, reply) {
  const dados = pedidoSchema.parse(request.body);

  const pedido = await pedidoService.criarPedido(dados);

  return reply.code(201).send(pedido);
}

const statusSchema = z.object({
  status: z.enum([
    "PENDENTE",
    "EM_PREPARO",
    "PRONTO",
    "SAIU_PARA_ENTREGA",
    "ENTREGUE",
    "CANCELADO",
  ]),
});

// Atualizar status
export async function atualizarStatusPedido(request, reply) {
  const { id } = request.params;

  const { status } = statusSchema.parse(request.body);

  return await pedidoService.atualizarStatusPedido(id, status);
}

// Excluir pedido
export async function deletarPedido(request, reply) {
  const { id } = request.params;

  await pedidoService.deletarPedido(id);

  return {
    mensagem: "Pedido excluído com sucesso!",
  };
}
