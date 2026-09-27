import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Beef,
  Beer,
  CupSoda,
  Flame,
  IceCreamCone,
  Search,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";

import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { useCliente } from "../context/ClienteContext";

import ProdutoCard from "../components/ProdutoCard";
import ProdutoModal from "../components/ProdutoModal";

import "../styles/home.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ICONE_CATEGORIA = {
  hamburguer: Beef,
  hambúrguer: Beef,
  hamburgueres: Beef,
  hambúrgueres: Beef,
  batata: UtensilsCrossed,
  batatas: UtensilsCrossed,
  bebida: CupSoda,
  bebidas: CupSoda,
  cerveja: Beer,
  cervejas: Beer,
  sobremesa: IceCreamCone,
  sobremesas: IceCreamCone,
};

function iconeDaCategoria(nome = "") {
  const chave = nome.toLowerCase().trim();
  return ICONE_CATEGORIA[chave] || Flame;
}

export default function Home() {
  const navigate = useNavigate();
  const { totalItens, subtotal } = useCart();
  const { dados, cadastroFeito, enderecoFeito } = useCliente();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [produtoAberto, setProdutoAberto] = useState(null);

  useEffect(() => {
    if (!cadastroFeito) {
      navigate("/cliente", { replace: true });
    } else if (!enderecoFeito) {
      navigate("/cliente/endereco", { replace: true });
    }
  }, [cadastroFeito, enderecoFeito, navigate]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [{ data: produtosData }, { data: categoriasData }] =
        await Promise.all([api.get("/produtos"), api.get("/categorias")]);

      setProdutos(produtosData.filter((produto) => produto.disponivel));
      setCategorias(categoriasData);
    } catch (erro) {
      console.error("Erro ao carregar produtos:", erro);
    } finally {
      setCarregando(false);
    }
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const bateCategoria =
        !categoriaAtiva || produto.categoriaId === categoriaAtiva;

      const bateBusca = produto.nome
        .toLowerCase()
        .includes(pesquisa.toLowerCase());

      return bateCategoria && bateBusca;
    });
  }, [produtos, categoriaAtiva, pesquisa]);

  const destaque = useMemo(
    () => produtos.find((produto) => produto.destaque),
    [produtos]
  );

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-topo">
          <span className="hero-selo">PASSO 3 DE 5</span>

          <div className="hero-nota">
            <Star size={13} fill="#f7b718" color="#f7b718" />
            <b>4.9</b>
          </div>
        </div>

        <img
          src="/logo-monster-burgers.png"
          alt="Monster Burgers"
          className="hero-logo"
        />

        <p className="hero-sub">
          {dados.nome ? `Fala, ${dados.nome.split(" ")[0]}! ` : ""}
          Monte seu pedido
        </p>

        {destaque && (
          <div className="hero-destaque">
            <span>HOJE NA GRELHA</span>
            <b>{destaque.nome}</b>
            <em>{money.format(destaque.preco)}</em>
          </div>
        )}

        <div className="hero-serrilha" aria-hidden="true" />
      </header>

      <section className="pesquisar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Pesquisar no cardápio..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </section>

      {categorias.length > 0 && (
        <section className="categorias">
          <button
            className={`ficha ${categoriaAtiva === null ? "ativa" : ""}`}
            onClick={() => setCategoriaAtiva(null)}
          >
            <i className="furo" />
            <UtensilsCrossed size={13} />
            Tudo
          </button>

          {categorias.map((categoria) => {
            const Icone = iconeDaCategoria(categoria.nome);

            return (
              <button
                key={categoria.id}
                className={`ficha ${
                  categoriaAtiva === categoria.id ? "ativa" : ""
                }`}
                onClick={() => setCategoriaAtiva(categoria.id)}
              >
                <i className="furo" />
                <Icone size={13} />
                {categoria.nome}
              </button>
            );
          })}
        </section>
      )}

      <section className="produtos">
        <div className="produtos-titulo">
          <h2>Cardápio</h2>
          <span>{produtosFiltrados.length} itens</span>
        </div>

        {carregando ? (
          <p className="produtos-status">Preparando o cardápio...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="produtos-status">Nenhum produto encontrado.</p>
        ) : (
          <div className="produtos-lista">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onAbrir={setProdutoAberto}
              />
            ))}
          </div>
        )}
      </section>

      <ProdutoModal
        produto={produtoAberto}
        fechar={() => setProdutoAberto(null)}
      />

      {totalItens > 0 && (
        <button
          className="selo-carrinho"
          onClick={() => navigate("/cliente/carrinho")}
        >
          <ShoppingBag size={20} />
          <span className="selo-carrinho-contador">{totalItens}</span>
          <b>{money.format(subtotal)}</b>
        </button>
      )}
    </div>
  );
}
