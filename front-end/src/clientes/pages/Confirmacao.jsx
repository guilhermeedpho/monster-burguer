import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Share2 } from "lucide-react";

import { api } from "../services/api";
import { socket } from "../services/socket";
import "../styles/checkout.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ETAPAS = [
  { chave: "PENDENTE", label: "Pendente" },
  { chave: "EM_PREPARO", label: "Em preparo" },
  { chave: "PRONTO", label: "Pronto" },
  { chave: "SAIU_PARA_ENTREGA", label: "Saiu para entrega" },
  { chave: "ENTREGUE", label: "Entregue" },
];

export default function Confirmacao() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    api
      .get(`/pedidos/rastrear/${codigo}`)
      .then(({ data }) => setPedido(data))
      .catch(console.error);

    // Entra na sala desse pedido específico — só recebe atualização
    // desse pedido, nunca de outros clientes.
    socket.emit("acompanhar-pedido", codigo);

    function aoAtualizar(atualizado) {
      if (atualizado.codigoAcompanhamento === codigo) {
        setPedido(atualizado);
      }
    }

    socket.on("pedido-atualizado", aoAtualizar);

    return () => {
      socket.off("pedido-atualizado", aoAtualizar);
    };
  }, [codigo]);

  async function compartilhar() {
    const texto = `Acompanhe meu pedido na Monster Burguer: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Meu pedido", text: texto });
      } catch {
        // usuário cancelou o compartilhamento
      }
    } else {
      await navigator.clipboard.writeText(texto);
      alert("Link copiado para a área de transferência!");
    }
  }

  if (!pedido) {
    return (
      <div className="checkout-page">
        <p>Carregando pedido...</p>
      </div>
    );
  }

  const etapaAtualIndex = pedido.status === "CANCELADO"
    ? -1
    : ETAPAS.findIndex((etapa) => etapa.chave === pedido.status);

  return (
    <div className="checkout-page confirmacao">
      <h1>Pedido enviado!</h1>

      <p>
        Seu pedido <b>#{pedido.id}</b> foi recebido pela loja.
      </p>

      {pedido.status === "CANCELADO" ? (
        <div className="confirmacao-status cancelado">Pedido cancelado</div>
      ) : (
        <div className="acompanhamento">
          {ETAPAS.map((etapa, index) => {
            const concluida = index <= etapaAtualIndex;
            const atual = index === etapaAtualIndex;

            return (
              <div
                key={etapa.chave}
                className={`etapa ${concluida ? "concluida" : ""} ${
                  atual ? "atual" : ""
                }`}
              >
                <span>{concluida ? <Check size={13} /> : null}</span>
                <p>{etapa.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="confirmacao-resumo">
        {pedido.itens.map((item) => (
          <div key={item.id}>
            <span>
              {item.quantidade}x {item.produto?.nome}
            </span>
            <b>{money.format(item.preco * item.quantidade)}</b>
          </div>
        ))}

        <div className="confirmacao-total">
          <span>Total</span>
          <b>{money.format(pedido.total)}</b>
        </div>
      </div>

      <button className="btn-finalizar" onClick={() => navigate("/cliente/cardapio")}>
        Voltar ao cardápio
      </button>

      <button className="btn-compartilhar" onClick={compartilhar}>
        <Share2 size={16} />
        Compartilhar pedido
      </button>
    </div>
  );
}
