import { prisma } from "../database/prisma.js";
import { notificarCozinha, notificarPedido } from "../socket/socket.js";
import { calcularPrecoItem, calcularTotalPedido } from "./calculoPedido.js";

// Criar pedido
export async function criarPedido(dados) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(dados.clienteId) },
  });

  if (!cliente) {
    const erro = new Error("Cliente não encontrado.");
    erro.statusCode = 404;
    throw erro;
  }

  let subtotal = 0;
  const itensPedido = [];

  for (const item of dados.itens) {
    const produto = await prisma.produto.findUnique({
      where: {
        id: Number(item.produtoId),
      },
      include: {
        adicionais: true,
      },
    });

    if (!produto) {
      const erro = new Error(`Produto ${item.produtoId} não encontrado.`);
      erro.statusCode = 404;
      throw erro;
    }

    if (!produto.disponivel) {
      const erro = new Error(`O produto "${produto.nome}" não está disponível no momento.`);
      erro.statusCode = 409;
      throw erro;
    }

    const { precoUnitario, adicionaisEscolhidos } = calcularPrecoItem(
      produto,
      item.adicionaisIds
    );

    subtotal += precoUnitario * item.quantidade;

    itensPedido.push({
      produtoId: produto.id,
      quantidade: item.quantidade,
      preco: precoUnitario,
      opcaoPonto: item.opcaoPonto || null,
      observacao: item.observacao || null,
      adicionaisEscolhidos: adicionaisEscolhidos.length
        ? JSON.stringify(
            adicionaisEscolhidos.map((adicional) => ({
              nome: adicional.nome,
              preco: adicional.preco,
            }))
          )
        : null,
    });
  }

  const total = calcularTotalPedido({
    subtotal,
    taxaEntrega: dados.taxaEntrega,
    desconto: dados.desconto,
  });

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: cliente.id,

      total,

      status: "PENDENTE",

      formaPagamento: dados.formaPagamento,

      tipoEntrega: dados.tipoEntrega,

      trocoPara: dados.trocoPara
        ? Number(dados.trocoPara)
        : null,

      observacao: dados.observacao,

      itens: {
        create: itensPedido,
      },
    },

    include: {
      cliente: true,

      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  // Notifica só a cozinha/admin — nunca vai pra outros clientes conectados
  notificarCozinha("novo-pedido", pedido);

  return pedido;
}

// Listar pedidos
export async function listarPedidos() {
  return await prisma.pedido.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      cliente: true,

      itens: {
        include: {
          produto: true,
        },
      },
    },
  });
}

// Buscar pedido
export async function buscarPedido(id) {
  return await prisma.pedido.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      cliente: true,

      itens: {
        include: {
          produto: true,
        },
      },
    },
  });
}

/**
 * Busca pública usada pela tela de acompanhamento do cliente — usa o
 * código não sequencial (UUID), nunca o id interno, pra não dar pra
 * "adivinhar" o pedido de outra pessoa trocando um número na URL.
 */
export async function buscarPedidoPorCodigo(codigo) {
  return await prisma.pedido.findUnique({
    where: {
      codigoAcompanhamento: codigo,
    },

    include: {
      cliente: {
        select: { nome: true }, // não expõe telefone/endereço na tela pública
      },

      itens: {
        include: {
          produto: true,
        },
      },
    },
  });
}

// Atualizar status
export async function atualizarStatusPedido(id, status) {

  const pedido = await prisma.pedido.update({
    where: {
      id: Number(id),
    },

    data: {
      status,
    },

    include: {
      cliente: true,

      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  // Atualiza a cozinha/admin e só quem está acompanhando ESSE pedido
  notificarCozinha("pedido-atualizado", pedido);
  notificarPedido(pedido.codigoAcompanhamento, "pedido-atualizado", pedido);

  return pedido;
}

// Excluir pedido
export async function deletarPedido(id) {
  return await prisma.pedido.delete({
    where: {
      id: Number(id),
    },
  });
}