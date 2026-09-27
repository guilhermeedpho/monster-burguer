import { useCallback, useEffect, useRef, useState } from "react";
import {
  BellRing,
  Check,
  ChefHat,
  Clock3,
  Expand,
  Printer,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { api } from "../services/api";
import { socket } from "../services/socket";
import "../styles/cozinha.css";

const formatarHora = (data) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));

export default function Cozinha() {
  const [pedidos, setPedidos] = useState([]);
  const [somAtivo, setSomAtivo] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  const audioLiberado = useRef(false);

  function tocarSom() {
    if (!audioLiberado.current) return;

    try {
      const contexto = new (window.AudioContext || window.webkitAudioContext)();

      // Dois "beeps" curtos (dó e mi), sem depender de nenhum arquivo de áudio.
      [523.25, 659.25].forEach((frequencia, indice) => {
        const oscilador = contexto.createOscillator();
        const ganho = contexto.createGain();

        oscilador.type = "sine";
        oscilador.frequency.value = frequencia;

        const inicio = contexto.currentTime + indice * 0.16;

        ganho.gain.setValueAtTime(0, inicio);
        ganho.gain.linearRampToValueAtTime(0.35, inicio + 0.02);
        ganho.gain.exponentialRampToValueAtTime(0.001, inicio + 0.28);

        oscilador.connect(ganho);
        ganho.connect(contexto.destination);

        oscilador.start(inicio);
        oscilador.stop(inicio + 0.3);
      });

      setTimeout(() => contexto.close(), 700);
    } catch (erro) {
      console.log("Erro ao tocar som:", erro);
    }
  }

  const carregarPedidos = useCallback(async () => {
    try {
      const { data } = await api.get("/pedidos");

      const ativos = data.filter((pedido) =>
        ["PENDENTE", "EM_PREPARO", "PRONTO"].includes(pedido.status)
      );

      setPedidos(ativos);
      setUltimaAtualizacao(new Date());
    } catch (erro) {
      console.error("Erro ao carregar pedidos:", erro);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();

    socket.on("novo-pedido", (pedido) => {
      console.log("Novo pedido:", pedido);

      tocarSom();

      carregarPedidos();
    });

    socket.on("pedido-atualizado", () => {
      carregarPedidos();
    });

    return () => {
      socket.off("novo-pedido");
      socket.off("pedido-atualizado");
    };
  }, [carregarPedidos]);

  async function alterarStatus(id, status) {
    try {
      await api.patch(`/pedidos/${id}/status`, {
        status,
      });

      carregarPedidos();
    } catch (erro) {
      console.error(erro);
      alert("Erro ao atualizar o pedido.");
    }
  }

  async function excluirPedido(pedido) {
    if (
      !confirm(
        `Excluir o pedido #${pedido.id} de ${pedido.cliente?.nome || "cliente"}? Essa ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/pedidos/${pedido.id}`);
      carregarPedidos();
    } catch (erro) {
      console.error(erro);
      alert("Erro ao excluir pedido.");
    }
  }

  function alternarTelaCheia() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  function ativarSom() {
    audioLiberado.current = !audioLiberado.current;

    setSomAtivo(audioLiberado.current);

    if (audioLiberado.current) {
      tocarSom();
    }
  }

  function escaparHtml(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (caractere) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[caractere]));
  }

  function imprimirPedido(pedido) {
    const janela = window.open("", "_blank", "width=400,height=700");

    if (!janela) return;

    janela.document.write(`
      <html>
      <head>
        <title>Pedido #${pedido.id}</title>

        <style>
          body{
            font-family:Arial;
            padding:20px;
          }

          h2{
            margin:0;
          }

          .item{
            padding:8px 0;
            border-bottom:1px dashed #999;
          }
        </style>
      </head>

      <body>

      <h2>MONSTER BURGERS</h2>

      <p><b>Pedido:</b> #${pedido.id}</p>

      <p><b>Cliente:</b> ${escaparHtml(pedido.cliente?.nome || "Cliente")}</p>

      ${pedido.itens
        .map((item) => {
          let adicionais = [];

          try {
            adicionais = item.adicionaisEscolhidos
              ? JSON.parse(item.adicionaisEscolhidos)
              : [];
          } catch {
            adicionais = [];
          }

          const linhas = [
            `<div class="item"><b>${item.quantidade}x ${escaparHtml(
              item.produto?.nome
            )}</b>${
              item.opcaoPonto ? ` — ${escaparHtml(item.opcaoPonto)}` : ""
            }`,
            adicionais.length
              ? `<div>+ ${escaparHtml(
                  adicionais.map((a) => a.nome).join(", ")
                )}</div>`
              : "",
            item.observacao
              ? `<div>Obs: ${escaparHtml(item.observacao)}</div>`
              : "",
            `</div>`,
          ];

          return linhas.join("");
        })
        .join("")}

      ${
        pedido.observacao
          ? `<p><b>Obs. geral:</b> ${escaparHtml(pedido.observacao)}</p>`
          : ""
      }

      </body>
      </html>
    `);

    janela.document.close();
    janela.focus();
    janela.print();
  }

  const pendentes = pedidos.filter((pedido) => pedido.status === "PENDENTE");

  const preparando = pedidos.filter(
    (pedido) => pedido.status === "EM_PREPARO"
  );

  const prontos = pedidos.filter((pedido) => pedido.status === "PRONTO");

  return (
    <section className="kitchen-page">
      <header className="kitchen-header">
        <div>
          <p>MONSTER BURGERS • COZINHA</p>

          <h1>Central da Cozinha</h1>

          <span>Atualizado às {formatarHora(ultimaAtualizacao)}</span>
        </div>

        <div className="kitchen-actions">
          <button
            className={somAtivo ? "sound-on" : ""}
            onClick={ativarSom}
          >
            {somAtivo ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {somAtivo ? " Som ativo" : " Ativar som"}
          </button>

          <button onClick={alternarTelaCheia}>
            <Expand size={18} />
            Tela cheia
          </button>
        </div>
      </header>

      <div className="kitchen-board">
        <KitchenColumn
          title="Novos pedidos"
          subtitle="Aguardando preparo"
          icon={BellRing}
          count={pendentes.length}
          tone="waiting"
        >
          {pendentes.map((pedido) => (
            <OrderCard key={pedido.id} pedido={pedido} imprimir={imprimirPedido} excluir={excluirPedido}>
              <button
                className="start"
                onClick={() => alterarStatus(pedido.id, "EM_PREPARO")}
              >
                <ChefHat size={18} />
                Iniciar preparo
              </button>
            </OrderCard>
          ))}
        </KitchenColumn>

        <KitchenColumn
          title="Em preparo"
          subtitle="Na chapa"
          icon={ChefHat}
          count={preparando.length}
          tone="cooking"
        >
          {preparando.map((pedido) => (
            <OrderCard key={pedido.id} pedido={pedido} imprimir={imprimirPedido} excluir={excluirPedido}>
              <button
                className="finish"
                onClick={() => alterarStatus(pedido.id, "PRONTO")}
              >
                <Check size={18} />
                Marcar como pronto
              </button>
            </OrderCard>
          ))}
        </KitchenColumn>

        <KitchenColumn
          title="Prontos"
          subtitle="Entrega / Retirada"
          icon={Check}
          count={prontos.length}
          tone="ready"
        >
          {prontos.map((pedido) => (
            <OrderCard key={pedido.id} pedido={pedido} imprimir={imprimirPedido} excluir={excluirPedido}>
              <button
                className="deliver"
                onClick={() =>
                  alterarStatus(
                    pedido.id,
                    pedido.tipoEntrega === "DELIVERY"
                      ? "SAIU_PARA_ENTREGA"
                      : "ENTREGUE"
                  )
                }
              >
                <Check size={18} />

                {pedido.tipoEntrega === "DELIVERY"
                  ? "Saiu para entrega"
                  : "Finalizar"}
              </button>
            </OrderCard>
          ))}
        </KitchenColumn>
      </div>
    </section>
  );
}

function KitchenColumn({ title, subtitle, icon: Icon, count, tone, children }) {
  return (
    <section className={`kitchen-column ${tone}`}>
      <header>
        <div className="kitchen-title">
          <span>
            <Icon size={20} />
          </span>

          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        <b>{count}</b>
      </header>

      <div className="kitchen-cards">
        {children && children.length > 0 ? (
          children
        ) : (
          <div className="kitchen-empty">
            <Clock3 size={22} />
            <p>Nenhum pedido.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function OrderCard({ pedido, imprimir, excluir, children }) {
  return (
    <article className="kitchen-order">
      <div className="kitchen-order-top">
        <strong>#{String(pedido.id).padStart(3, "0")}</strong>

        <span>{formatarHora(pedido.createdAt)}</span>

        <button onClick={() => imprimir(pedido)}>
          <Printer size={16} />
        </button>

        <button className="kitchen-excluir" onClick={() => excluir(pedido)}>
          <Trash2 size={16} />
        </button>
      </div>

      <h3>{pedido.cliente?.nome || "Cliente"}</h3>

      <p className="kitchen-delivery">{pedido.tipoEntrega || "BALCÃO"}</p>

      <div className="kitchen-items">
        {pedido.itens?.map((item) => {
          let adicionais = [];

          try {
            adicionais = item.adicionaisEscolhidos
              ? JSON.parse(item.adicionaisEscolhidos)
              : [];
          } catch {
            adicionais = [];
          }

          return (
            <div key={item.id} className="kitchen-item">
              <p>
                <b>{item.quantidade}x</b> {item.produto?.nome}
                {item.opcaoPonto ? ` — ${item.opcaoPonto}` : ""}
              </p>

              {adicionais.length > 0 && (
                <p className="kitchen-item-extra">
                  + {adicionais.map((a) => a.nome).join(", ")}
                </p>
              )}

              {item.observacao && (
                <p className="kitchen-item-extra">Obs: {item.observacao}</p>
              )}
            </div>
          );
        })}
      </div>

      {pedido.observacao && (
        <div className="kitchen-note">Obs geral: {pedido.observacao}</div>
      )}

      <footer>{children}</footer>
    </article>
  );
}
