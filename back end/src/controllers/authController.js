import { z } from "zod";
import * as authService from "../services/authService.js";
import { prisma } from "../database/prisma.js";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function login(request, reply) {
  const { email, senha } = loginSchema.parse(request.body);

  const usuario = await authService.autenticar(email, senha);

  const token = await reply.jwtSign(
    { sub: usuario.id, papel: usuario.papel },
    { expiresIn: "12h" }
  );

  return { token, usuario };
}

const bootstrapSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8, "A senha precisa ter no mínimo 8 caracteres."),
});

/** Só funciona uma vez — cria o primeiro admin do sistema. */
export async function bootstrap(request, reply) {
  const dados = bootstrapSchema.parse(request.body);

  const usuario = await authService.criarPrimeiroAdmin(dados);

  return reply.code(201).send(usuario);
}

const criarUsuarioSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8, "A senha precisa ter no mínimo 8 caracteres."),
  papel: z.enum(["ADMIN", "FUNCIONARIO"]).default("FUNCIONARIO"),
});

/** Criar novos acessos — exige estar autenticado (rota protegida). */
export async function criarUsuario(request, reply) {
  const dados = criarUsuarioSchema.parse(request.body);

  const usuario = await authService.criarUsuario(dados);

  return reply.code(201).send(usuario);
}

export async function eu(request, reply) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: request.usuario.id },
    select: { id: true, nome: true, email: true, papel: true },
  });

  return { usuario };
}
