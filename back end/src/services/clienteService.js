import { prisma } from "../database/prisma.js";

// Listar todos os clientes
export async function listarClientes() {
  return await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pedidos: true } } },
  });
}

// Buscar cliente por ID
export async function buscarCliente(id) {
  return await prisma.cliente.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      pedidos: {
        orderBy: { createdAt: "desc" },
        include: { itens: { include: { produto: true } } },
      },
    },
  });
}

// Criar cliente
export async function criarCliente(dados) {
  return await prisma.cliente.create({
    data: dados,
  });
}

/**
 * Usado pelo checkout público: encontra o cliente pelo telefone e
 * atualiza os dados, ou cria um novo se não existir. Nunca expõe
 * nem exige o id de outro cliente — o telefone (que só o próprio
 * dono conhece) é a única chave de busca.
 */
export async function registrarOuAtualizarPorTelefone(dados) {
  const existente = await prisma.cliente.findUnique({
    where: { telefone: dados.telefone },
  });

  if (existente) {
    return { id: existente.id, nome: existente.nome };
  }

  const criado = await prisma.cliente.create({ data: dados });
  return { id: criado.id, nome: criado.nome };
}

// Atualizar cliente
export async function atualizarCliente(id, dados) {
  return await prisma.cliente.update({
    where: {
      id: Number(id),
    },
    data: dados,
  });
}

// Excluir cliente
export async function deletarCliente(id) {
  return await prisma.cliente.delete({
    where: {
      id: Number(id),
    },
  });
}
