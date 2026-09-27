import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { api } from "../services/api";

import "./ModalProduto.css";

export default function ModalProduto({
  aberto,
  fechar,
  atualizarProdutos,
  produto,
}) {
  const [categorias, setCategorias] = useState([]);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [imagemUrl, setImagemUrl] = useState("");
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const inputArquivoRef = useRef(null);

  const [ingredientes, setIngredientes] = useState("");
  const [sabores, setSabores] = useState("");
  const [tempoPreparo, setTempoPreparo] = useState("");

  const [adicionais, setAdicionais] = useState([]);

  const [disponivel, setDisponivel] = useState(true);
  const [destaque, setDestaque] = useState(false);

  useEffect(() => {
    if (aberto) {
      carregarCategorias();
    }
  }, [aberto]);

  useEffect(() => {
    if (produto) {
      setNome(produto.nome || "");
      setPreco(produto.preco ?? "");
      setDescricao(produto.descricao || "");

      // Categoria opcional
      setCategoriaId(produto.categoriaId || "");

      // Imagem existente
      setImagemUrl(produto.imagemUrl || "");

      setIngredientes(produto.ingredientes || "");
      setSabores(produto.sabores || "");
      setTempoPreparo(produto.tempoPreparo || "");

      setAdicionais(
        (produto.adicionais || []).map((a) => ({
          nome: a.nome,
          preco: a.preco,
        }))
      );

      setDisponivel(produto.disponivel ?? true);
      setDestaque(produto.destaque ?? false);
    } else {
      limparFormulario();
    }
  }, [produto]);

  function limparFormulario() {
    setNome("");
    setPreco("");
    setDescricao("");
    setCategoriaId("");
    setImagemUrl("");
    setIngredientes("");
    setSabores("");
    setTempoPreparo("");
    setAdicionais([]);
    setDisponivel(true);
    setDestaque(false);
  }

  /**
   * Converte:
   * /uploads/imagem.jpg
   *
   * para:
   * http://localhost:3000/uploads/imagem.jpg
   *
   * Se já for uma URL completa, mantém.
   */
  function obterUrlImagem(url) {
    if (!url) {
      return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `http://localhost:3000${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  }

  function adicionarLinhaAdicional() {
    setAdicionais((atual) => [
      ...atual,
      {
        nome: "",
        preco: "",
      },
    ]);
  }

  function alterarAdicional(indice, campo, valor) {
    setAdicionais((atual) =>
      atual.map((item, i) =>
        i === indice
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  function removerAdicional(indice) {
    setAdicionais((atual) =>
      atual.filter((_, i) => i !== indice)
    );
  }

  async function carregarCategorias() {
    try {
      const { data } = await api.get("/categorias");

      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  async function selecionarImagem(evento) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      alert(
        "Selecione um arquivo de imagem (JPG, PNG, WEBP ou GIF)."
      );

      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      alert("A imagem precisa ter no máximo 5MB.");

      return;
    }

    const formData = new FormData();

    formData.append("file", arquivo);

    setEnviandoImagem(true);

    try {
      const { data } = await api.post("/upload", formData);

      /**
       * O backend pode devolver:
       *
       * /uploads/imagem.jpg
       *
       * ou:
       *
       * http://localhost:3000/uploads/imagem.jpg
       *
       * Aqui normalizamos os dois formatos.
       */
      const urlImagem = obterUrlImagem(data.url);

      setImagemUrl(urlImagem);
    } catch (error) {
      console.error("Erro no upload:", error);

      alert(
        error.response?.data?.erro ||
          "Erro ao enviar a imagem. Tente novamente."
      );
    } finally {
      setEnviandoImagem(false);

      evento.target.value = "";
    }
  }

  async function salvarProduto() {
    // Apenas nome e preço são obrigatórios.
    // Categoria, descrição, imagem, ingredientes,
    // sabores e tempo de preparo são opcionais.

    if (!nome.trim() || preco === "" || preco === null) {
      alert("Preencha o nome e o preço do produto.");

      return;
    }

    if (Number(preco) < 0) {
      alert("Informe um preço válido.");

      return;
    }

    const adicionaisValidos = adicionais
      .map((a) => ({
        nome: a.nome.trim(),
        preco: a.preco,
      }))
      .filter((a) => a.nome);

    const adicionalInvalido = adicionaisValidos.find(
      (a) =>
        a.preco === "" ||
        a.preco === null ||
        Number(a.preco) < 0
    );

    if (adicionalInvalido) {
      alert(
        `Informe um preço válido para o adicional "${adicionalInvalido.nome}".`
      );

      return;
    }

    const dados = {
      nome: nome.trim(),

      preco: Number(preco),

      descricao: descricao.trim() || null,

      // Categoria opcional.
      categoriaId: categoriaId
        ? Number(categoriaId)
        : null,

      // Imagem opcional.
      imagemUrl: imagemUrl || null,

      ingredientes: ingredientes.trim() || null,

      sabores: sabores.trim() || null,

      tempoPreparo: tempoPreparo
        ? Number(tempoPreparo)
        : null,

      disponivel,

      destaque,

      adicionais: adicionaisValidos.map((a) => ({
        nome: a.nome,
        preco: Number(a.preco),
      })),
    };

    try {
      if (produto) {
        await api.put(
          `/produtos/${produto.id}`,
          dados
        );

        alert("Produto atualizado com sucesso!");
      } else {
        await api.post(
          "/produtos",
          dados
        );

        alert("Produto cadastrado com sucesso!");
      }

      atualizarProdutos();

      limparFormulario();

      fechar();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      console.error(
        "Resposta da API:",
        error.response?.data
      );

      alert(
        error.response?.data?.erro ||
          "Erro ao salvar produto."
      );
    }
  }

  if (!aberto) return null;

  const imagemParaExibir = obterUrlImagem(imagemUrl);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {produto
            ? "Editar Produto"
            : "Novo Produto"}
        </h2>

        <div className="campo">
          <label>Nome</label>

          <input
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
          />
        </div>

        <div className="campo">
          <label>Categoria</label>

          <select
            value={categoriaId}
            onChange={(e) =>
              setCategoriaId(e.target.value)
            }
          >
            <option value="">
              Sem categoria
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Preço</label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={preco}
            onChange={(e) =>
              setPreco(e.target.value)
            }
          />
        </div>

        <div className="campo">
          <label>Foto do produto</label>

          <input
            ref={inputArquivoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={selecionarImagem}
            style={{ display: "none" }}
          />

          {imagemParaExibir ? (
            <div className="preview-imagem">
              <img
                src={imagemParaExibir}
                alt="Prévia do produto"
                onError={(e) => {
                  console.error(
                    "Erro ao carregar imagem:",
                    imagemParaExibir
                  );

                  e.currentTarget.style.display = "none";
                }}
              />

              <button
                type="button"
                className="remover-imagem"
                onClick={() =>
                  setImagemUrl("")
                }
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="botao-upload"
              disabled={enviandoImagem}
              onClick={() =>
                inputArquivoRef.current?.click()
              }
            >
              {enviandoImagem ? (
                <>
                  <Loader2
                    size={16}
                    className="spin"
                  />

                  Enviando...
                </>
              ) : (
                <>
                  <ImagePlus size={16} />

                  Selecionar imagem
                </>
              )}
            </button>
          )}

          {imagemParaExibir && (
            <button
              type="button"
              className="trocar-imagem"
              disabled={enviandoImagem}
              onClick={() =>
                inputArquivoRef.current?.click()
              }
            >
              Trocar imagem
            </button>
          )}
        </div>

        <div className="campo">
          <label>Descrição</label>

          <textarea
            rows="3"
            value={descricao}
            onChange={(e) =>
              setDescricao(e.target.value)
            }
          />
        </div>

        <div className="campo">
          <label>Ingredientes</label>

          <textarea
            rows="2"
            value={ingredientes}
            onChange={(e) =>
              setIngredientes(e.target.value)
            }
          />
        </div>

        <div className="campo">
          <label>Sabores</label>

          <input
            value={sabores}
            onChange={(e) =>
              setSabores(e.target.value)
            }
          />
        </div>

        <div className="campo">
          <label>
            Tempo de preparo (min)
          </label>

          <input
            type="number"
            min="0"
            value={tempoPreparo}
            onChange={(e) =>
              setTempoPreparo(e.target.value)
            }
          />
        </div>

        <div className="campo">
          <label>
            Adicionais (bacon, queijo extra, molho...)
          </label>

          <div className="lista-adicionais">
            {adicionais.length === 0 && (
              <p className="sem-adicionais">
                Nenhum adicional cadastrado. O cliente
                não verá opção de personalizar esse
                produto além da observação livre.
              </p>
            )}

            {adicionais.map((item, indice) => (
              <div
                className="linha-adicional"
                key={indice}
              >
                <input
                  placeholder="Nome (ex.: Bacon)"
                  value={item.nome}
                  onChange={(e) =>
                    alterarAdicional(
                      indice,
                      "nome",
                      e.target.value
                    )
                  }
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Preço"
                  value={item.preco}
                  onChange={(e) =>
                    alterarAdicional(
                      indice,
                      "preco",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="remover-linha"
                  onClick={() =>
                    removerAdicional(indice)
                  }
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="botao-add-adicional"
            onClick={adicionarLinhaAdicional}
          >
            + Adicionar opção
          </button>
        </div>

        <div className="checks">
          <label>
            <input
              type="checkbox"
              checked={disponivel}
              onChange={(e) =>
                setDisponivel(e.target.checked)
              }
            />

            Disponível
          </label>

          <label>
            <input
              type="checkbox"
              checked={destaque}
              onChange={(e) =>
                setDestaque(e.target.checked)
              }
            />

            Produto destaque
          </label>
        </div>

        <div className="acoes">
          <button
            type="button"
            className="cancelar"
            onClick={() => {
              limparFormulario();
              fechar();
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="salvar"
            onClick={salvarProduto}
          >
            {produto
              ? "Atualizar"
              : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}