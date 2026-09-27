import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function NovoPedido() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [clienteId, setClienteId] = useState("");

  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const [tipoEntrega, setTipoEntrega] = useState("BALCAO");

  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    carregarClientes();
    carregarProdutos();
  }, []);

  async function carregarClientes() {
    const response = await api.get("/clientes");
    setClientes(response.data);
  }

  async function carregarProdutos() {
    const response = await api.get("/produtos");
    setProdutos(response.data);
  }

  return (
    <div className="pedidos">

      <h1>Novo Pedido</h1>

      <div className="campo">
        <label>Cliente</label>

        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        >
          <option value="">Selecione...</option>

          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label>Produtos</label>

        <select>
          <option>Selecione um produto</option>

          {produtos.map((produto) => (
            <option key={produto.id}>
              {produto.nome} - R$ {produto.preco}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label>Forma de Pagamento</label>

        <select
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
        >
          <option>PIX</option>
          <option>DINHEIRO</option>
          <option>CRÉDITO</option>
          <option>DÉBITO</option>
        </select>
      </div>

      <div className="campo">
        <label>Entrega</label>

        <select
          value={tipoEntrega}
          onChange={(e) => setTipoEntrega(e.target.value)}
        >
          <option>BALCAO</option>
          <option>RETIRADA</option>
          <option>DELIVERY</option>
        </select>
      </div>

      <div className="campo">
        <label>Observação</label>

        <textarea
          rows="4"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>

      <button className="btn-novo">
        Salvar Pedido
      </button>

    </div>
  );
}