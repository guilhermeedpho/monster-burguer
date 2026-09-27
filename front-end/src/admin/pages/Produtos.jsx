import { useEffect, useMemo, useState } from "react";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";

import { api } from "../services/api";
import ModalProduto from "../components/ModalProduto";
import "../styles/produtos.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const { data } = await api.get("/produtos");
      setProdutos(data);
    } catch (erro) {
      console.error("Erro ao carregar produtos:", erro);
    }
  }

  async function excluirProduto(produto) {
    if (!confirm(`Excluir o produto "${produto.nome}"?`)) return;

    try {
      await api.delete(`/produtos/${produto.id}`);
      carregarProdutos();
    } catch (erro) {
      console.error("Erro ao excluir produto:", erro);
      alert("Erro ao excluir produto.");
    }
  }

  function abrirNovo() {
    setProdutoEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(produto) {
    setProdutoEditando(produto);
    setModalAberto(true);
  }

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(termo)
    );
  }, [busca, produtos]);

  function obterUrlImagem(imagemUrl) {
    if (!imagemUrl) {
      return null;
    }

    // Se já for uma URL completa
    if (
      imagemUrl.startsWith("http://") ||
      imagemUrl.startsWith("https://")
    ) {
      return imagemUrl;
    }

    // Se for /uploads/arquivo.jpg
    return `http://localhost:3000${imagemUrl.startsWith("/") ? "" : "/"}${imagemUrl}`;
  }

  return (
    <section className="produtos">
      <div className="produtos-topo">
        <div>
          <h1>Cardápio</h1>
          <p>Gerencie os produtos disponíveis para venda.</p>
        </div>

        <button className="btn-novo" onClick={abrirNovo}>
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      <input
        className="pesquisa"
        placeholder="Pesquisar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <table className="tabela-produtos">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="5">Nenhum produto encontrado.</td>
            </tr>
          ) : (
            produtosFiltrados.map((produto) => {
              const urlImagem = obterUrlImagem(produto.imagemUrl);

              return (
                <tr key={produto.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {urlImagem ? (
                        <img
                          className="foto-produto"
                          src={urlImagem}
                          alt={produto.nome}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="sem-foto">
                          <ImageOff size={18} />
                        </div>
                      )}

                      <b>{produto.nome}</b>
                    </div>
                  </td>

                  <td>{produto.categoria?.nome || "-"}</td>

                  <td>{money.format(produto.preco)}</td>

                  <td>
                    <span
                      className={
                        produto.disponivel ? "ativo" : "inativo"
                      }
                    >
                      {produto.disponivel
                        ? "Disponível"
                        : "Indisponível"}
                    </span>
                  </td>

                  <td className="acoes">
                    <button onClick={() => abrirEdicao(produto)}>
                      <Pencil size={16} />
                    </button>

                    <button onClick={() => excluirProduto(produto)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <ModalProduto
        aberto={modalAberto}
        fechar={() => setModalAberto(false)}
        atualizarProdutos={carregarProdutos}
        produto={produtoEditando}
      />
    </section>
  );
}