import { prisma } from "../database/prisma.js";

export async function obterDashboard() {
  const pedidosPendentes = await prisma.pedido.count({
    where: {
      status: "PENDENTE",
    },
  });

  const pedidosEmPreparo = await prisma.pedido.count({
    where: {
      status: "EM_PREPARO",
    },
  });

  const pedidosEntrega = await prisma.pedido.count({
    where: {
      status: "SAIU_PARA_ENTREGA",
    },
  });

  const pedidosEntregues = await prisma.pedido.count({
    where: {
      status: "ENTREGUE",
    },
  });

  const faturamento = await prisma.pedido.aggregate({
    where: {
      status: "ENTREGUE",
    },
    _sum: {
      total: true,
    },
  });

  return {
    pedidosPendentes,
    pedidosEmPreparo,
    pedidosEntrega,
    pedidosEntregues,
    faturamentoHoje: faturamento._sum.total || 0,
  };
}