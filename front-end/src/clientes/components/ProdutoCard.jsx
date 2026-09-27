import { Plus } from "lucide-react";
import "../styles/ProdutoCard.css";

export default function ProdutoCard({ produto, onAbrir }) {
  return (
    <div className="produto-card" onClick={() => onAbrir(produto)}>
      <div className="produto-card-imagem">
        <img
          src={
            produto.imagemUrl ||
            "https://placehold.co/600x400?text=Monster+Burger"
          }
          alt={produto.nome}
        />

        <span className="produto-preco-selo">
          R$ {Number(produto.preco).toFixed(2)}
        </span>
      </div>

      <div className="produto-info">
        <h3>{produto.nome}</h3>
        {produto.descricao && <p>{produto.descricao}</p>}

        <button
          type="button"
          className="produto-add"
          onClick={(e) => {
            e.stopPropagation();
            onAbrir(produto);
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
