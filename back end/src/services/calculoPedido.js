/**
 * Lógica pura de cálculo de preço do pedido — sem tocar no banco.
 * Fica separada do pedidoService pra poder ser testada isoladamente
 * (ver calculoPedido.test.js), já que é a parte mais crítica do
 * sistema: qualquer bug aqui é dinheiro errado saindo ou entrando.
 */

/**
 * Calcula o preço unitário de um item, somando apenas os adicionais
 * que realmente pertencem ao produto (protege contra tentativa de
 * enviar um adicionalId de outro produto pra "descontar" preço).
 */
export function calcularPrecoItem(produto, adicionaisIds = []) {
  const adicionaisEscolhidos = (adicionaisIds || [])
    .map((adicionalId) =>
      produto.adicionais.find((adicional) => adicional.id === adicionalId)
    )
    .filter(Boolean);

  const precoUnitario =
    produto.preco +
    adicionaisEscolhidos.reduce((soma, adicional) => soma + adicional.preco, 0);

  return { precoUnitario, adicionaisEscolhidos };
}

/**
 * Calcula o total do pedido a partir do subtotal dos itens, aplicando
 * taxa de entrega e desconto com as travas de sanidade:
 * - desconto nunca deixa o total menor que zero
 * - desconto nunca é maior que o próprio subtotal
 */
export function calcularTotalPedido({ subtotal, taxaEntrega = 0, desconto = 0 }) {
  let total = subtotal;

  if (taxaEntrega) {
    total += Number(taxaEntrega);
  }

  if (desconto) {
    total -= Math.min(Number(desconto), subtotal);
  }

  return Math.max(total, 0);
}
