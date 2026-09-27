import * as clienteService from "../services/clienteService.js";
import { z } from "zod";

// Listar clientes
export async function listarClientes(request, reply) {
  return await clienteService.listarClientes();
}

// Buscar cliente por ID
export async function buscarCliente(request, reply) {
  const { id } = request.params;

  return await clienteService.buscarCliente(id);
}

const registroPublicoSchema = z.object({
  nome: z.string().min(3).max(120),
  telefone: z.string().min(8).max(30),
  rua: z.string().max(160).optional(),
  numero: z.string().max(30).optional(),
  complemento: z.string().max(120).optional(),
  bairro: z.string().max(120).optional(),
  cidade: z.string().max(120).optional(),
  estado: z.string().max(2).optional(),
  referencia: z.string().max(200).optional(),
});

const clienteSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  telefone: z.string().min(8, "Telefone inválido."),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  cpf: z.string().optional(),

  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  referencia: z.string().optional(),

  observacao: z.string().optional(),
});

// Criar cliente (uso administrativo)
export async function criarCliente(request, reply) {
  const dados = clienteSchema.parse(request.body);

  return await clienteService.criarCliente(dados);
}

/**
 * Endpoint público usado pelo checkout do cliente final: encontra
 * (pelo telefone) ou cria o cadastro. Não expõe nem exige nenhum id
 * de outro cliente, então é seguro deixar sem login.
 */
export async function registrarPorTelefone(request, reply) {
  const dados = registroPublicoSchema.parse(request.body);

  return await clienteService.registrarOuAtualizarPorTelefone(dados);
}

// Atualizar cliente (uso administrativo)
export async function atualizarCliente(request, reply) {
  const { id } = request.params;

  const dados = clienteSchema.parse(request.body);

  return await clienteService.atualizarCliente(id, dados);
}

// Excluir cliente
export async function deletarCliente(request, reply) {
  const { id } = request.params;

  await clienteService.deletarCliente(id);

  return {
    mensagem: "Cliente removido com sucesso!",
  };
}