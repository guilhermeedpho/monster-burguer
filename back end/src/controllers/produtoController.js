import * as produtoService from "../services/produtoService.js";
import { z } from "zod";

const schema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres."),

  preco: z
    .number()
    .positive("Preço inválido."),

  descricao: z
    .string()
    .nullable()
    .optional(),

  categoriaId: z
    .number()
    .positive()
    .nullable()
    .optional(),

  imagemUrl: z
    .string()
    .nullable()
    .optional(),

  ingredientes: z
    .string()
    .nullable()
    .optional(),

  sabores: z
    .string()
    .nullable()
    .optional(),

  disponivel: z
    .boolean()
    .default(true),

  destaque: z
    .boolean()
    .default(false),

  tempoPreparo: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  adicionais: z
    .array(
      z.object({
        nome: z
          .string()
          .min(1, "Nome obrigatório."),

        preco: z
          .number()
          .min(0),
      })
    )
    .default([]),
});

// Listar
export async function listarProdutos() {
  return await produtoService.listarProdutos();
}

// Buscar
export async function buscarProduto(request) {
  return await produtoService.buscarProduto(request.params.id);
}

// Criar
export async function criarProduto(request, reply) {
  const dados = schema.parse(request.body);

  return await produtoService.criarProduto(dados);
}

// Atualizar
export async function atualizarProduto(request, reply) {
  const dados = schema.parse(request.body);

  return await produtoService.atualizarProduto(
    request.params.id,
    dados
  );
}

// Excluir
export async function deletarProduto(request) {
  await produtoService.deletarProduto(
    request.params.id
  );

  return {
    mensagem: "Produto removido com sucesso!",
  };
}