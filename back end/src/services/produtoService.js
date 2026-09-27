import { prisma } from "../database/prisma.js";
import { cachear, invalidarCache } from "../utils/cache.js";

const includeProduto = {
  categoria: true,
  adicionais: true,
};

const CHAVE_CACHE_LISTA = "produtos:lista";
const TTL_CACHE_MS = 30_000;

// ================================
// LISTAR PRODUTOS
// ================================
export async function listarProdutos() {
  return cachear(CHAVE_CACHE_LISTA, TTL_CACHE_MS, () =>
    prisma.produto.findMany({
      orderBy: {
        nome: "asc",
      },
      include: includeProduto,
    })
  );
}

// ================================
// BUSCAR PRODUTO
// ================================
export async function buscarProduto(id) {
  return prisma.produto.findUnique({
    where: {
      id: Number(id),
    },
    include: includeProduto,
  });
}

// ================================
// CRIAR PRODUTO
// ================================
export async function criarProduto(dados) {
  const {
    categoriaId,
    adicionais = [],
    ...produto
  } = dados;

  const criado = await prisma.produto.create({
    data: {
      nome: produto.nome,
      preco: Number(produto.preco),

      descricao: produto.descricao ?? null,
      imagemUrl: produto.imagemUrl ?? null,

      ingredientes: produto.ingredientes ?? null,
      sabores: produto.sabores ?? null,

      disponivel: produto.disponivel,
      destaque: produto.destaque,

      tempoPreparo: produto.tempoPreparo
        ? Number(produto.tempoPreparo)
        : null,

      // Categoria é opcional
      categoriaId: categoriaId
        ? Number(categoriaId)
        : null,

      adicionais: {
        create: adicionais,
      },
    },

    include: includeProduto,
  });

  invalidarCache(CHAVE_CACHE_LISTA);

  return criado;
}

// ================================
// ATUALIZAR PRODUTO
// ================================
export async function atualizarProduto(id, dados) {
  const {
    categoriaId,
    adicionais = [],
    ...produto
  } = dados;

  const atualizado = await prisma.produto.update({
    where: {
      id: Number(id),
    },

    data: {
      nome: produto.nome,
      preco: Number(produto.preco),

      descricao: produto.descricao ?? null,
      imagemUrl: produto.imagemUrl ?? null,

      ingredientes: produto.ingredientes ?? null,
      sabores: produto.sabores ?? null,

      disponivel: produto.disponivel,
      destaque: produto.destaque,

      tempoPreparo: produto.tempoPreparo
        ? Number(produto.tempoPreparo)
        : null,

      // Categoria é opcional
      categoriaId: categoriaId
        ? Number(categoriaId)
        : null,

      adicionais: {
        deleteMany: {},
        create: adicionais,
      },
    },

    include: includeProduto,
  });

  invalidarCache(CHAVE_CACHE_LISTA);

  return atualizado;
}

// ================================
// EXCLUIR PRODUTO
// ================================
export async function deletarProduto(id) {
  const produtoId = Number(id);

  // Verifica se o produto existe
  const produto = await prisma.produto.findUnique({
    where: {
      id: produtoId,
    },
  });

  if (!produto) {
    throw new Error("Produto não encontrado.");
  }

  // Verifica se o produto já foi utilizado em algum pedido
  const itemPedido = await prisma.itemPedido.findFirst({
    where: {
      produtoId: produtoId,
    },
  });

  // Se já foi utilizado em pedido,
  // não apagamos fisicamente para preservar o histórico.
  if (itemPedido) {
    const atualizado = await prisma.produto.update({
      where: {
        id: produtoId,
      },

      data: {
        disponivel: false,
      },

      include: includeProduto,
    });

    invalidarCache(CHAVE_CACHE_LISTA);

    return {
      tipo: "desativado",
      mensagem:
        "Este produto já foi utilizado em um pedido e não pode ser excluído. Ele foi marcado como indisponível.",
      produto: atualizado,
    };
  }

  // Se nunca foi utilizado em pedido,
  // podemos excluir normalmente.
  const removido = await prisma.$transaction(async (tx) => {
    // Primeiro remove os adicionais
    await tx.adicional.deleteMany({
      where: {
        produtoId: produtoId,
      },
    });

    // Depois remove o produto
    return tx.produto.delete({
      where: {
        id: produtoId,
      },
    });
  });

  invalidarCache(CHAVE_CACHE_LISTA);

  return {
    tipo: "excluido",
    mensagem: "Produto removido com sucesso!",
    produto: removido,
  };
}