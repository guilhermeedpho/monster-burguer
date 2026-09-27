import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function assinaturaItem(produto) {
  const adicionais = (produto.adicionaisIds || []).slice().sort().join("-");
  return [
    produto.id,
    produto.opcaoPonto || "",
    adicionais,
    produto.observacao || "",
  ].join("|");
}

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionar(produto) {
    const chave = assinaturaItem(produto);
    const quantidadeInicial = produto.quantidadeInicial || 1;

    setItens((atual) => {
      const existente = atual.find((item) => item.chave === chave);

      if (existente) {
        return atual.map((item) =>
          item.chave === chave
            ? { ...item, quantidade: item.quantidade + quantidadeInicial }
            : item
        );
      }

      return [
        ...atual,
        {
          chave,
          produtoId: produto.id,
          nome: produto.nome,
          imagemUrl: produto.imagemUrl,
          preco: produto.precoUnitario ?? produto.preco,
          quantidade: quantidadeInicial,
          opcaoPonto: produto.opcaoPonto || null,
          observacao: produto.observacao || null,
          adicionaisIds: produto.adicionaisIds || [],
          adicionaisNomes: produto.adicionaisNomes || [],
        },
      ];
    });
  }

  function alterarQuantidade(chave, delta) {
    setItens((atual) =>
      atual
        .map((item) =>
          item.chave === chave
            ? { ...item, quantidade: item.quantidade + delta }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function remover(chave) {
    setItens((atual) => atual.filter((item) => item.chave !== chave));
  }

  function limpar() {
    setItens([]);
  }

  const totalItens = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens]
  );

  const subtotal = useMemo(
    () => itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0),
    [itens]
  );

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionar,
        alterarQuantidade,
        remover,
        limpar,
        totalItens,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);

  if (!contexto) {
    throw new Error("useCart precisa ser usado dentro de um CartProvider.");
  }

  return contexto;
}
