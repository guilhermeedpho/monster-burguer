import { prisma } from "../database/prisma.js";
import { cachear, invalidarCache } from "../utils/cache.js";

const CHAVE_CACHE_LISTA = "categorias:lista";
const TTL_CACHE_MS = 30_000;

// Listar categorias
export async function listarCategorias() {
  return cachear(CHAVE_CACHE_LISTA, TTL_CACHE_MS, () =>
    prisma.categoria.findMany()
  );
}

// Buscar categoria
export async function buscarCategoria(id) {
  return await prisma.categoria.findUnique({
    where: {
      id: Number(id),
    },
  });
}

// Criar categoria
export async function criarCategoria(dados) {
  const criada = await prisma.categoria.create({
    data: dados,
  });

  invalidarCache(CHAVE_CACHE_LISTA);
  return criada;
}

// Atualizar categoria
export async function atualizarCategoria(id, dados) {
  const atualizada = await prisma.categoria.update({
    where: {
      id: Number(id),
    },
    data: dados,
  });

  invalidarCache(CHAVE_CACHE_LISTA);
  return atualizada;
}

// Excluir categoria
export async function deletarCategoria(id) {
  const removida = await prisma.categoria.delete({
    where: {
      id: Number(id),
    },
  });

  invalidarCache(CHAVE_CACHE_LISTA);
  return removida;
}
