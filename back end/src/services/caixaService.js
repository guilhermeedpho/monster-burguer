import { prisma } from "../database/prisma.js";

const incluirMovimentacoes = { movimentacoes: { orderBy: { createdAt: "desc" } } };

const totalAtual = (caixa) =>
  caixa.saldoInicial +
  caixa.movimentacoes.reduce(
    (total, movimentacao) =>
      total + (movimentacao.tipo === "SANGRIA" ? -movimentacao.valor : movimentacao.valor),
    0
  );

function erroComStatus(mensagem, statusCode) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

export async function caixaAberto() {
  const caixa = await prisma.caixa.findFirst({
    where: { status: "ABERTO" },
    orderBy: { abertoEm: "desc" },
    include: incluirMovimentacoes,
  });

  return caixa ? { ...caixa, saldoAtual: totalAtual(caixa) } : null;
}

export async function abrirCaixa(saldoInicial) {
  const aberto = await prisma.caixa.findFirst({ where: { status: "ABERTO" } });

  if (aberto) throw erroComStatus("Já existe um caixa aberto.", 409);

  const caixa = await prisma.caixa.create({
    data: { saldoInicial },
    include: incluirMovimentacoes,
  });

  return { ...caixa, saldoAtual: caixa.saldoInicial };
}

export async function adicionarMovimentacao(caixaId, dados) {
  const caixa = await prisma.caixa.findFirst({
    where: { id: Number(caixaId), status: "ABERTO" },
  });

  if (!caixa) throw erroComStatus("Caixa aberto não encontrado.", 404);

  await prisma.movimentacaoCaixa.create({ data: { caixaId: caixa.id, ...dados } });

  return caixaAberto();
}

export async function fecharCaixa(id) {
  const caixa = await prisma.caixa.findFirst({
    where: { id: Number(id), status: "ABERTO" },
    include: incluirMovimentacoes,
  });

  if (!caixa) throw erroComStatus("Caixa aberto não encontrado.", 404);

  const saldoFinal = totalAtual(caixa);

  return prisma.caixa.update({
    where: { id: caixa.id },
    data: { status: "FECHADO", saldoFinal, fechadoEm: new Date() },
    include: incluirMovimentacoes,
  });
}

export async function historicoCaixas() {
  const caixas = await prisma.caixa.findMany({
    orderBy: { abertoEm: "desc" },
    include: incluirMovimentacoes,
  });

  return caixas.map((caixa) => ({
    ...caixa,
    saldoAtual: caixa.status === "ABERTO" ? totalAtual(caixa) : caixa.saldoFinal,
  }));
}
