import { test } from "node:test";
import assert from "node:assert/strict";

import { calcularPrecoItem, calcularTotalPedido } from "./calculoPedido.js";

function produtoFalso(preco, adicionais = []) {
  return { preco, adicionais };
}

test("calcularPrecoItem: sem adicionais, retorna só o preço do produto", () => {
  const produto = produtoFalso(29.9);

  const { precoUnitario, adicionaisEscolhidos } = calcularPrecoItem(produto, []);

  assert.equal(precoUnitario, 29.9);
  assert.deepEqual(adicionaisEscolhidos, []);
});

test("calcularPrecoItem: soma corretamente os adicionais escolhidos", () => {
  const produto = produtoFalso(29.9, [
    { id: 1, nome: "Bacon", preco: 5 },
    { id: 2, nome: "Cheddar", preco: 4 },
  ]);

  const { precoUnitario, adicionaisEscolhidos } = calcularPrecoItem(produto, [1, 2]);

  assert.equal(precoUnitario, 38.9);
  assert.equal(adicionaisEscolhidos.length, 2);
});

test("calcularPrecoItem: ignora adicionalId que não pertence ao produto (proteção contra tampering)", () => {
  const produto = produtoFalso(29.9, [{ id: 1, nome: "Bacon", preco: 5 }]);

  // 999 não existe nesse produto — deve ser ignorado, não deve quebrar
  // nem "descontar" preço.
  const { precoUnitario, adicionaisEscolhidos } = calcularPrecoItem(produto, [1, 999]);

  assert.equal(precoUnitario, 34.9);
  assert.equal(adicionaisEscolhidos.length, 1);
});

test("calcularTotalPedido: soma a taxa de entrega", () => {
  const total = calcularTotalPedido({ subtotal: 50, taxaEntrega: 8 });
  assert.equal(total, 58);
});

test("calcularTotalPedido: aplica desconto normalmente", () => {
  const total = calcularTotalPedido({ subtotal: 50, desconto: 10 });
  assert.equal(total, 40);
});

test("calcularTotalPedido: desconto nunca deixa o total negativo", () => {
  // Tentativa de mandar um desconto maior que o subtotal (ex.: requisição
  // adulterada direto na API, sem passar pelo front-end).
  const total = calcularTotalPedido({ subtotal: 50, desconto: 999999 });
  assert.equal(total, 0);
});

test("calcularTotalPedido: taxa de entrega e desconto combinados", () => {
  const total = calcularTotalPedido({ subtotal: 50, taxaEntrega: 8, desconto: 10 });
  assert.equal(total, 48);
});

test("calcularTotalPedido: sem taxa nem desconto, total = subtotal", () => {
  const total = calcularTotalPedido({ subtotal: 50 });
  assert.equal(total, 50);
});
