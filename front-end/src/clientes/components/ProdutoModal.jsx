import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import { useCart } from "../context/CartContext";
import "../styles/produtoModal.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const OPCOES_PONTO = ["Mal passado", "Ao ponto", "Bem passado"];

export default function ProdutoModal({ produto, fechar }) {
  const { adicionar } = useCart();

  const [ponto, setPonto] = useState("");
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]);
  const [observacao, setObservacao] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    setPonto("");
    setAdicionaisSelecionados([]);
    setObservacao("");
    setQuantidade(1);
  }, [produto]);

  useEffect(() => {
    function fecharComEsc(e) {
      if (e.key === "Escape") fechar();
    }

    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [fechar]);

  const precoUnitario = useMemo(() => {
    if (!produto) return 0;

    return (
      produto.preco +
      adicionaisSelecionados.reduce((soma, a) => soma + a.preco, 0)
    );
  }, [produto, adicionaisSelecionados]);

  if (!produto) return null;

  const temPonto = /hamburguer|hambúrguer|burger|carne/i.test(
    `${produto.nome} ${produto.categoria?.nome || ""}`
  );

  function alternarAdicional(adicional) {
    setAdicionaisSelecionados((atual) => {
      const jaTem = atual.find((a) => a.id === adicional.id);

      if (jaTem) {
        return atual.filter((a) => a.id !== adicional.id);
      }

      return [...atual, adicional];
    });
  }

  const precoTotal = precoUnitario * quantidade;

  function confirmarAdicao() {
    adicionar({
      ...produto,
      opcaoPonto: ponto || undefined,
      observacao: observacao || undefined,
      adicionaisIds: adicionaisSelecionados.map((a) => a.id),
      adicionaisNomes: adicionaisSelecionados.map((a) => a.nome),
      precoUnitario,
      quantidadeInicial: quantidade,
    });

    fechar();
  }

  return (
    <div className="produto-modal-backdrop" onClick={fechar}>
      <div className="produto-modal" onClick={(e) => e.stopPropagation()}>
        <button className="produto-modal-fechar" onClick={fechar}>
          <X size={18} />
        </button>

        <div className="produto-modal-imagem">
          <img
            src={
              produto.imagemUrl ||
              "https://placehold.co/600x400?text=Monster+Burger"
            }
            alt={produto.nome}
          />
        </div>

        <div className="produto-modal-corpo">
          <h2>{produto.nome}</h2>

          {produto.descricao && <p className="descricao">{produto.descricao}</p>}

          {produto.ingredientes && (
            <div className="produto-modal-secao">
              <h3>Ingredientes</h3>
              <p>{produto.ingredientes}</p>
            </div>
          )}

          {temPonto && (
            <div className="produto-modal-secao">
              <h3>Escolha o ponto</h3>

              {OPCOES_PONTO.map((opcao) => (
                <label key={opcao} className="opcao-radio">
                  <input
                    type="radio"
                    name="ponto"
                    checked={ponto === opcao}
                    onChange={() => setPonto(opcao)}
                  />
                  {opcao}
                </label>
              ))}
            </div>
          )}

          {produto.adicionais?.length > 0 && (
            <div className="produto-modal-secao">
              <h3>Adicionais</h3>

              {produto.adicionais.map((adicional) => (
                <label key={adicional.id} className="opcao-checkbox">
                  <input
                    type="checkbox"
                    checked={adicionaisSelecionados.some(
                      (a) => a.id === adicional.id
                    )}
                    onChange={() => alternarAdicional(adicional)}
                  />
                  {adicional.nome}
                  <span>+ {money.format(adicional.preco)}</span>
                </label>
              ))}
            </div>
          )}

          <div className="produto-modal-secao">
            <h3>Observação</h3>

            <textarea
              rows="2"
              placeholder="Ex.: sem cebola, sem tomate..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <div className="produto-modal-rodape">
            <div className="quantidade-stepper">
              <button
                type="button"
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>

              <span>{quantidade}</span>

              <button
                type="button"
                onClick={() => setQuantidade((q) => q + 1)}
              >
                <Plus size={16} />
              </button>
            </div>

            <button className="btn-adicionar-carrinho" onClick={confirmarAdicao}>
              Adicionar — {money.format(precoTotal)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
