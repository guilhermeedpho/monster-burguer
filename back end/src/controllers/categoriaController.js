import * as categoriaService from "../services/categoriaService.js";
import { z } from "zod";

// Listar categorias
export async function listarCategorias(request, reply) {
  return await categoriaService.listarCategorias();
}

// Buscar categoria
export async function buscarCategoria(request, reply) {
  const { id } = request.params;

  return await categoriaService.buscarCategoria(id);
}

// Criar categoria
export async function criarCategoria(request, reply) {
  const categoriaSchema = z.object({
    nome: z.string().min(3),
  });

  const dados = categoriaSchema.parse(request.body);

  return await categoriaService.criarCategoria(dados);
}

// Atualizar categoria
export async function atualizarCategoria(request, reply) {
  const { id } = request.params;

  const categoriaSchema = z.object({
    nome: z.string().min(3),
  });

  const dados = categoriaSchema.parse(request.body);

  return await categoriaService.atualizarCategoria(id, dados);
}

// Excluir categoria
export async function deletarCategoria(request, reply) {
  const { id } = request.params;

  await categoriaService.deletarCategoria(id);

  return {
    mensagem: "Categoria removida com sucesso!",
  };
}