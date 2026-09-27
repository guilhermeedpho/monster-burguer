import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ModalCategoria({
  aberto,
  fechar,
  atualizarCategorias,
  categoria,
}) {
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
    } else {
      setNome("");
    }
  }, [categoria]);

  async function salvarCategoria() {
    if (!nome.trim()) {
      alert("Informe o nome da categoria.");
      return;
    }

    try {
      if (categoria) {
        await api.put(`/categorias/${categoria.id}`, {
          nome,
        });

        alert("Categoria atualizada com sucesso!");
      } else {
        await api.post("/categorias", {
          nome,
        });

        alert("Categoria cadastrada com sucesso!");
      }

      atualizarCategorias();
      fechar();
      setNome("");

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar categoria.");
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>
          {categoria ? "Editar Categoria" : "Nova Categoria"}
        </h2>

        <div className="campo">
          <label>Nome</label>

          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Hambúrgueres"
          />
        </div>

        <div className="acoes">

          <button
            className="cancelar"
            onClick={fechar}
          >
            Cancelar
          </button>

          <button
            className="salvar"
            onClick={salvarCategoria}
          >
            {categoria ? "Atualizar" : "Salvar"}
          </button>

        </div>

      </div>

    </div>
  );
}