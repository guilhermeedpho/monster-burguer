import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { api } from "../services/api";
import ModalCliente from "../components/ModalCliente";
import "../styles/clientes.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function iniciais(nome) {
  return (nome || "?")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const { data } = await api.get("/clientes");
      setClientes(data);
    } catch (erro) {
      console.error(erro);
    }
  }

  async function abrirPerfil(cliente) {
    try {
      const { data } = await api.get(`/clientes/${cliente.id}`);
      setPerfil(data);
    } catch (erro) {
      console.error(erro);
    }
  }

  async function excluirCliente(cliente) {
    if (!confirm(`Excluir o cliente "${cliente.nome}"?`)) return;

    try {
      await api.delete(`/clientes/${cliente.id}`);
      carregarClientes();
    } catch (erro) {
      console.error(erro);
      alert(
        "Erro ao excluir cliente. Verifique se não há pedidos vinculados a ele."
      );
    }
  }

  function abrirNovo() {
    setClienteEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(cliente) {
    setClienteEditando(cliente);
    setModalAberto(true);
  }

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.telefone.includes(termo)
    );
  }, [busca, clientes]);

  const totalPedidos = useMemo(
    () => clientes.reduce((soma, c) => soma + (c._count?.pedidos || 0), 0),
    [clientes]
  );

  return (
    <section className="customers-page">
      <div className="customers-heading">
        <div>
          <p className="eyebrow">CLIENTES</p>
          <h1>Clientes</h1>
          <p>Cadastro e histórico de quem compra na loja.</p>
        </div>

        <button onClick={abrirNovo}>
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      <div className="customer-summary">
        <article>
          <span>{clientes.length}</span>
          <p>Clientes cadastrados</p>
        </article>

        <article>
          <span>{totalPedidos}</span>
          <p>Pedidos realizados</p>
        </article>

        <article>
          <span>
            {clientes.length
              ? (totalPedidos / clientes.length).toFixed(1)
              : 0}
          </span>
          <p>Pedidos por cliente</p>
        </article>
      </div>

      <div className="customer-search">
        <Search size={16} />

        <input
          placeholder="Pesquisar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="customers-table-wrap">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contato</th>
              <th>Endereço</th>
              <th>Pedidos</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td className="no-customers" colSpan="5">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div
                      className="customer-name"
                      style={{ cursor: "pointer" }}
                      onClick={() => abrirPerfil(cliente)}
                    >
                      <span>{iniciais(cliente.nome)}</span>

                      <div>
                        <b>{cliente.nome}</b>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="contact">
                      <Phone size={13} />
                      {cliente.telefone}
                    </div>
                  </td>

                  <td>
                    {cliente.cidade
                      ? `${cliente.bairro || ""} — ${cliente.cidade}`
                      : "-"}
                  </td>

                  <td>{cliente._count?.pedidos ?? 0}</td>

                  <td>
                    <div className="customer-actions">
                      <button
                        className="delete"
                        onClick={() => excluirCliente(cliente)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalCliente
        aberto={modalAberto}
        fechar={() => setModalAberto(false)}
        atualizarClientes={carregarClientes}
        cliente={clienteEditando}
      />

      {perfil && (
        <div className="profile-backdrop" onClick={() => setPerfil(null)}>
          <div className="customer-profile" onClick={(e) => e.stopPropagation()}>
            <button className="profile-close" onClick={() => setPerfil(null)}>
              <X size={16} />
            </button>

            <div className="profile-top">
              <span>{iniciais(perfil.nome)}</span>

              <div>
                <h2>{perfil.nome}</h2>
              </div>
            </div>

            <div className="profile-stats">
              <div>
                <b>{perfil.pedidos?.length || 0}</b>
                <span>Pedidos realizados</span>
              </div>

              <div>
                <b>
                  {money.format(
                    (perfil.pedidos || []).reduce(
                      (soma, p) => soma + Number(p.total),
                      0
                    )
                  )}
                </b>
                <span>Total gasto</span>
              </div>
            </div>

            <div className="profile-contact">
              <p>
                <Phone size={14} /> {perfil.telefone}
              </p>

              {perfil.email && <p><UserRound size={14} /> {perfil.email}</p>}

              {perfil.cidade && (
                <p>
                  <MapPin size={14} />
                  {[perfil.rua, perfil.numero, perfil.bairro, perfil.cidade]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>

            <h3>
              <ShoppingBag size={15} /> Histórico de pedidos
            </h3>

            <div className="profile-orders">
              {(perfil.pedidos || []).length === 0 ? (
                <p>Nenhum pedido realizado ainda.</p>
              ) : (
                perfil.pedidos.map((pedido) => (
                  <article key={pedido.id}>
                    <div>
                      <b>Pedido #{pedido.id}</b>
                      <span>
                        {new Date(pedido.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}{" "}
                        — {pedido.status}
                      </span>
                    </div>

                    <strong>{money.format(pedido.total)}</strong>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
