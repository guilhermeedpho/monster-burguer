import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "../context/CartContext";
import { useCliente } from "../context/ClienteContext";
import "../styles/carrinho.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Carrinho() {
  const navigate = useNavigate();
  const { itens, alterarQuantidade, remover, subtotal } = useCart();
  const { cadastroFeito, enderecoFeito } = useCliente();

  useEffect(() => {
    if (!cadastroFeito) {
      navigate("/cliente", { replace: true });
    } else if (!enderecoFeito) {
      navigate("/cliente/endereco", { replace: true });
    }
  }, [cadastroFeito, enderecoFeito, navigate]);

  return (
    <div className="carrinho-page">
      <header className="carrinho-header">
        <button onClick={() => navigate("/cliente/cardapio")}>
          <ArrowLeft size={20} />
        </button>

        <h1>Seu carrinho</h1>
      </header>

      {itens.length === 0 ? (
        <div className="carrinho-vazio">
          <ShoppingBag size={40} />
          <p>Seu carrinho está vazio.</p>

          <button onClick={() => navigate("/cliente/cardapio")}>
            Ver cardápio
          </button>
        </div>
      ) : (
        <>
          <div className="carrinho-lista">
            {itens.map((item) => (
              <div className="carrinho-item" key={item.chave}>
                <img
                  src={
                    item.imagemUrl ||
                    "https://placehold.co/120x120?text=Monster"
                  }
                  alt={item.nome}
                />

                <div className="carrinho-item-info">
                  <b>{item.nome}</b>
                  <span>{money.format(item.preco)}</span>

                  {item.opcaoPonto && (
                    <small>Ponto: {item.opcaoPonto}</small>
                  )}

                  {item.adicionaisNomes?.length > 0 && (
                    <small>+ {item.adicionaisNomes.join(", ")}</small>
                  )}

                  {item.observacao && <small>Obs: {item.observacao}</small>}
                </div>

                <div className="carrinho-item-acoes">
                  <div className="quantidade">
                    <button
                      onClick={() => alterarQuantidade(item.chave, -1)}
                    >
                      <Minus size={14} />
                    </button>

                    <span>{item.quantidade}</span>

                    <button
                      onClick={() => alterarQuantidade(item.chave, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    className="remover"
                    onClick={() => remover(item.chave)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="carrinho-resumo">
            <div>
              <span>Subtotal</span>
              <b>{money.format(subtotal)}</b>
            </div>

            <p className="carrinho-aviso">
              Taxa de entrega e forma de pagamento são definidas na próxima etapa.
            </p>

            <button
              className="btn-finalizar"
              onClick={() => navigate("/cliente/pagamento")}
            >
              Continuar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
