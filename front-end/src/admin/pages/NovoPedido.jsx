import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../services/api";
import "../styles/novoPedido.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function NovoPedido() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [buscaProduto, setBuscaProduto] = useState("");
  const [carrinho, setCarrinho] = useState([]);

  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [tipoEntrega, setTipoEntrega] = useState("BALCAO");
  const [trocoPara, setTrocoPara] = useState("");
  const [desconto, setDesconto] = useState("");
  const [taxaEntrega, setTaxaEntrega] = useState("");
  const [observacao, setObservacao] = useState("");

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get("/clientes")
      .then(({ data }) => setClientes(data))
      .catch(console.error);

    api
      .get("/produtos")
      .then(({ data }) => setProdutos(data.filter((p) => p.disponivel)))
      .catch(console.error);
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return [];

    const termo = buscaCliente.toLowerCase();

    return clientes
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          c.telefone.includes(termo)
      )
      .slice(0, 6);
  }, [buscaCliente, clientes]);

  const produtosFiltrados = useMemo(() => {
    const termo = buscaProduto.toLowerCase();

    return produtos.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [buscaProduto, produtos]);

  function adicionarProduto(produto) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produtoId === produto.id);

      if (existente) {
        return atual.map((item) =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [
        ...atual,
        {
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
        },
      ];
    });
  }

  function alterarQuantidade(produtoId, delta) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: item.quantidade + delta }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function removerItem(produtoId) {
    setCarrinho((atual) =>
      atual.filter((item) => item.produtoId !== produtoId)
    );
  }

  const subtotal = useMemo(
    () =>
      carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0),
    [carrinho]
  );

  const total = useMemo(() => {
    let valor = subtotal;

    if (desconto) valor -= Number(desconto);
    if (tipoEntrega === "DELIVERY" && taxaEntrega)
      valor += Number(taxaEntrega);

    return Math.max(valor, 0);
  }, [subtotal, desconto, taxaEntrega, tipoEntrega]);

  async function salvarPedido() {
    if (!clienteSelecionado) {
      alert("Selecione um cliente.");
      return;
    }

    if (carrinho.length === 0) {
      alert("Adicione ao menos um produto ao pedido.");
      return;
    }

    setEnviando(true);

    try {
      await api.post("/pedidos", {
        clienteId: clienteSelecionado.id,
        formaPagamento,
        tipoEntrega,
        trocoPara:
          formaPagamento === "DINHEIRO" && trocoPara
            ? Number(trocoPara)
            : undefined,
        desconto: desconto ? Number(desconto) : undefined,
        taxaEntrega:
          tipoEntrega === "DELIVERY" && taxaEntrega
            ? Number(taxaEntrega)
            : undefined,
        observacao: observacao || undefined,
        itens: carrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      });

      alert("Pedido criado com sucesso!");
      navigate("/pedidos");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao criar o pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="order-page">
      <div className="page-title">
        <div>
          <p className="eyebrow">PEDIDOS</p>
          <h1>Novo Pedido</h1>
          <p>Monte um pedido manualmente para o cliente.</p>
        </div>

        <button className="close-order" onClick={() => navigate("/pedidos")}>
          <X size={16} />
          Cancelar
        </button>
      </div>

      <div className="order-layout">
        <div className="order-builder">
          <section className="order-section">
            <div className="section-title">
              <span>1</span>

              <div>
                <h2>Cliente</h2>
                <p>Busque um cliente já cadastrado</p>
              </div>
            </div>

            {clienteSelecionado ? (
              <div className="selected-customer">
                <span>
                  {clienteSelecionado.nome} — {clienteSelecionado.telefone}
                </span>

                <button onClick={() => setClienteSelecionado(null)}>
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <div className="search-field">
                  <Search size={16} />

                  <input
                    placeholder="Buscar por nome ou telefone"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                  />
                </div>

                {buscaCliente.trim() && (
                  <div className="search-results">
                    {clientesFiltrados.length === 0 ? (
                      <p>Nenhum cliente encontrado.</p>
                    ) : (
                      clientesFiltrados.map((cliente) => (
                        <button
                          key={cliente.id}
                          onClick={() => {
                            setClienteSelecionado(cliente);
                            setBuscaCliente("");
                          }}
                        >
                          <b>{cliente.nome}</b>
                          <span>{cliente.telefone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="order-section">
            <div className="section-title">
              <span>2</span>

              <div>
                <h2>Produtos</h2>
                <p>Clique em um produto para adicionar ao pedido</p>
              </div>
            </div>

            <div className="search-field">
              <Search size={16} />

              <input
                placeholder="Buscar produto..."
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
              />
            </div>

            <div className="product-results">
              {produtosFiltrados.length === 0 ? (
                <p>Nenhum produto encontrado.</p>
              ) : (
                produtosFiltrados.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => adicionarProduto(produto)}
                  >
                    <b>{produto.nome}</b>
                    <strong>{money.format(produto.preco)}</strong>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="order-section">
            <div className="section-title">
              <span>3</span>

              <div>
                <h2>Detalhes</h2>
                <p>Pagamento, entrega e observações</p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Forma de pagamento
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">DINHEIRO</option>
                  <option value="CREDITO">CRÉDITO</option>
                  <option value="DEBITO">DÉBITO</option>
                </select>
              </label>

              <label>
                Entrega
                <select
                  value={tipoEntrega}
                  onChange={(e) => setTipoEntrega(e.target.value)}
                >
                  <option value="BALCAO">BALCÃO</option>
                  <option value="RETIRADA">RETIRADA</option>
                  <option value="DELIVERY">DELIVERY</option>
                </select>
              </label>

              {formaPagamento === "DINHEIRO" && (
                <label>
                  Troco para
                  <input
                    type="number"
                    value={trocoPara}
                    onChange={(e) => setTrocoPara(e.target.value)}
                  />
                </label>
              )}

              {tipoEntrega === "DELIVERY" && (
                <label>
                  Taxa de entrega
                  <input
                    type="number"
                    value={taxaEntrega}
                    onChange={(e) => setTaxaEntrega(e.target.value)}
                  />
                </label>
              )}

              <label className="full">
                Observação
                <textarea
                  rows="3"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex.: sem cebola, ponto da carne, etc."
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="order-summary">
          <h2>Resumo do pedido</h2>

          <div className="cart-list">
            {carrinho.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={22} />
                <p>Nenhum item adicionado.</p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div className="cart-item" key={item.produtoId}>
                  <div className="cart-product">
                    <b>{item.nome}</b>
                    <span>{money.format(item.preco)} un.</span>
                  </div>

                  <div className="quantity">
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.produtoId, -1)}
                    >
                      <Minus size={13} />
                    </button>

                    <b>{item.quantidade}</b>

                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.produtoId, 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <strong>
                    {money.format(item.preco * item.quantidade)}
                  </strong>

                  <button
                    className="remove-item"
                    onClick={() => removerItem(item.produtoId)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div>
            <span>Subtotal</span>
            <b>{money.format(subtotal)}</b>
          </div>

          {tipoEntrega === "DELIVERY" && (
            <div>
              <span>Taxa de entrega</span>
              <b>{money.format(Number(taxaEntrega) || 0)}</b>
            </div>
          )}

          <label className="discount">
            Desconto (R$)
            <input
              type="number"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              placeholder="0,00"
            />
          </label>

          <div className="total">
            <span>Total</span>
            <b>{money.format(total)}</b>
          </div>

          {formaPagamento === "DINHEIRO" && trocoPara && (
            <p className="change">
              Troco: {money.format(Math.max(Number(trocoPara) - total, 0))}
            </p>
          )}

          <button
            className="save-order"
            disabled={enviando}
            onClick={salvarPedido}
          >
            {enviando ? "Salvando..." : "Finalizar Pedido"}
          </button>

          <small>O pedido é enviado direto para a cozinha.</small>
        </aside>
      </div>
    </section>
  );
}
