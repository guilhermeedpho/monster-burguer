import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  RefreshCw,
  Clock3,
  Trash2,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";

import { api } from "../services/api";

import "../styles/pedidos.css";

const STATUS = [
  "TODOS",
  "PENDENTE",
  "EM_PREPARO",
  "PRONTO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
];

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function dataLocalISO(data) {
  const d = new Date(data);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [pedidoAberto, setPedidoAberto] = useState(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    setCarregando(true);

    try {
      const { data } = await api.get("/pedidos");
      setPedidos(data);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  }

  async function alterarStatus(id, novoStatus) {
    try {
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
      carregarPedidos();
    } catch (erro) {
      console.error(erro);
      alert("Erro ao atualizar o status do pedido.");
    }
  }

  async function excluirPedido(pedido) {
    if (!confirm(`Excluir o pedido #${pedido.id}? Essa ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.delete(`/pedidos/${pedido.id}`);
      setPedidoAberto(null);
      carregarPedidos();
    } catch (erro) {
      console.error(erro);
      alert("Erro ao excluir pedido.");
    }
  }

  function limparFiltros() {
    setBusca("");
    setStatus("TODOS");
    setInicio("");
    setFim("");
  }

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const nome = pedido.cliente?.nome || "";
      const bateBusca = nome.toLowerCase().includes(busca.toLowerCase());

      const bateStatus = status === "TODOS" ? true : pedido.status === status;

      const dataPedido = dataLocalISO(pedido.createdAt);
      const bateInicio = !inicio || dataPedido >= inicio;
      const bateFim = !fim || dataPedido <= fim;

      return bateBusca && bateStatus && bateInicio && bateFim;
    });
  }, [pedidos, busca, status, inicio, fim]);

  return (
    <section className="orders-page">
      <div className="orders-heading">
        <div>
          <p className="eyebrow">PEDIDOS</p>
          <h1>Controle de Pedidos</h1>
          <p>Acompanhe, atualize e gerencie todos os pedidos da loja.</p>
        </div>

        <Link to="/pedidos/novo">
          <Plus size={17} />
          Novo Pedido
        </Link>
      </div>

      <div className="order-filters">
        <div className="orders-search">
          <Search size={16} />
          <input
            placeholder="Pesquisar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <span>STATUS</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown size={13} />
        </div>

        <div className="date-filter">
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>

        <div className="date-filter">
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>

        <button className="clear-filter" onClick={limparFiltros}>
          Limpar filtros
        </button>

        <button className="clear-filter" onClick={carregarPedidos}>
          <RefreshCw size={14} />
        </button>
      </div>

      {carregando ? (
        <div className="orders-loading">
          <Clock3 size={22} />
          <p>Carregando pedidos...</p>
        </div>
      ) : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Status</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td className="no-orders" colSpan="7">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <b>#{pedido.id}</b>
                    </td>

                    <td>{pedido.cliente?.nome || "Cliente"}</td>

                    <td>
                      {new Date(pedido.createdAt).toLocaleString("pt-BR")}
                    </td>

                    <td>
                      <select
                        className={`status-select ${pedido.status}`}
                        value={pedido.status}
                        onChange={(e) => alterarStatus(pedido.id, e.target.value)}
                      >
                        {STATUS.filter((s) => s !== "TODOS").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>{pedido.formaPagamento || "-"}</td>

                    <td>
                      <strong>{money.format(pedido.total)}</strong>
                    </td>

                    <td className="order-actions">
                      <button onClick={() => setPedidoAberto(pedido)}>
                        <Eye size={16} />
                      </button>

                      <button className="delete" onClick={() => excluirPedido(pedido)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pedidoAberto && (
        <div
          className="order-modal-backdrop"
          onClick={() => setPedidoAberto(null)}
        >
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPedidoAberto(null)}>
              <X size={16} />
            </button>

            <h2>Pedido #{pedidoAberto.id}</h2>

            <div className="modal-customer">
              <div>
                <span>Cliente</span>
                {pedidoAberto.cliente?.nome}
              </div>

              <div>
                <span>Telefone</span>
                {pedidoAberto.cliente?.telefone}
              </div>

              <div>
                <span>Entrega</span>
                {pedidoAberto.tipoEntrega || "-"}
              </div>

              <div>
                <span>Pagamento</span>
                {pedidoAberto.formaPagamento || "-"}
              </div>
            </div>

            <div className="modal-items">
              {pedidoAberto.itens?.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.quantidade}x {item.produto?.nome}
                  </span>
                  <b>{money.format(item.preco * item.quantidade)}</b>
                </div>
              ))}
            </div>

            <div className="modal-total">
              <span>Total</span>
              <b>{money.format(pedidoAberto.total)}</b>
            </div>

            {pedidoAberto.observacao && (
              <p className="modal-note">Obs: {pedidoAberto.observacao}</p>
            )}

            <button
              className="modal-delete"
              onClick={() => excluirPedido(pedidoAberto)}
            >
              <Trash2 size={15} />
              Excluir pedido
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
