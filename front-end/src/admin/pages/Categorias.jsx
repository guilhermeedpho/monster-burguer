import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { api } from "../services/api";
import ModalCategoria from "../components/ModalCategoria";
import "../styles/categorias.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    try {
      const { data } = await api.get("/categorias");
      setCategorias(data);
    } catch (erro) {
      console.error(erro);
    }
  }

  async function excluirCategoria(categoria) {
    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) return;

    try {
      await api.delete(`/categorias/${categoria.id}`);
      carregarCategorias();
    } catch (erro) {
      console.error(erro);
      alert(
        "Erro ao excluir categoria. Verifique se não há produtos vinculados a ela."
      );
    }
  }

  function abrirNova() {
    setCategoriaEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setCategoriaEditando(categoria);
    setModalAberto(true);
  }

  const categoriasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return categorias.filter((categoria) =>
      categoria.nome.toLowerCase().includes(termo)
    );
  }, [busca, categorias]);

  return (
    <section className="categorias">
      <div className="categorias-topo">
        <div>
          <h1>Categorias</h1>
          <p>Organize os produtos do cardápio por categoria.</p>
        </div>

        <button className="btn-novo" onClick={abrirNova}>
          <Plus size={18} />
          Nova Categoria
        </button>
      </div>

      <input
        className="pesquisa"
        placeholder="Pesquisar categoria..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <table className="tabela-categorias">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Produtos cadastrados</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {categoriasFiltradas.length === 0 ? (
            <tr>
              <td colSpan="3">Nenhuma categoria encontrada.</td>
            </tr>
          ) : (
            categoriasFiltradas.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.nome}</td>
                <td>{categoria.produtos?.length ?? "-"}</td>

                <td>
                  <button onClick={() => abrirEdicao(categoria)}>
                    <Pencil size={16} />
                  </button>

                  <button onClick={() => excluirCategoria(categoria)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ModalCategoria
        aberto={modalAberto}
        fechar={() => setModalAberto(false)}
        atualizarCategorias={carregarCategorias}
        categoria={categoriaEditando}
      />
    </section>
  );
}
