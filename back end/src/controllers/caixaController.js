import { z } from "zod";
import * as caixaService from "../services/caixaService.js";

export async function caixaAberto(request, reply) {
  return await caixaService.caixaAberto();
}

export async function abrirCaixa(request, reply) {
  const { saldoInicial } = z
    .object({ saldoInicial: z.number().min(0).max(1000000) })
    .parse(request.body);

  return await caixaService.abrirCaixa(saldoInicial);
}

export async function adicionarMovimentacao(request, reply) {
  const dados = z
    .object({
      tipo: z.enum(["SANGRIA", "SUPRIMENTO", "RECEBIMENTO"]),
      valor: z.number().positive().max(1000000),
      descricao: z.string().max(140).optional(),
    })
    .parse(request.body);

  return await caixaService.adicionarMovimentacao(request.params.id, dados);
}

export async function fecharCaixa(request, reply) {
  return await caixaService.fecharCaixa(request.params.id);
}

export async function historicoCaixas(request, reply) {
  return await caixaService.historicoCaixas();
}
