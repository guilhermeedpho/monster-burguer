import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma.js";

const CUSTO_HASH = 12;

export async function criarHashSenha(senha) {
  return bcrypt.hash(senha, CUSTO_HASH);
}

export async function conferirSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

function erroComStatus(mensagem, statusCode) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

export async function autenticar(email, senha) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Mensagem genérica de propósito: não revelar se o e-mail existe ou
  // não existe no sistema (evita enumeração de contas).
  if (!usuario || !usuario.ativo) {
    throw erroComStatus("E-mail ou senha inválidos.", 401);
  }

  const senhaConfere = await conferirSenha(senha, usuario.senhaHash);

  if (!senhaConfere) {
    throw erroComStatus("E-mail ou senha inválidos.", 401);
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  };
}

/** Só permite criar o primeiro admin se ainda não existir nenhum usuário. */
export async function criarPrimeiroAdmin({ nome, email, senha }) {
  const totalUsuarios = await prisma.usuario.count();

  if (totalUsuarios > 0) {
    throw erroComStatus(
      "Já existe um administrador cadastrado. Peça pra ele criar seu acesso.",
      409
    );
  }

  const senhaHash = await criarHashSenha(senha);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash, papel: "ADMIN" },
  });

  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

/** Criar novos usuários exige estar autenticado (feito no controller). */
export async function criarUsuario({ nome, email, senha, papel = "FUNCIONARIO" }) {
  const senhaHash = await criarHashSenha(senha);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash, papel },
  });

  return { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel };
}
