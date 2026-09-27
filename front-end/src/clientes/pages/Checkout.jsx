import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import "../styles/checkout.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Checkout() {
  const navigate = useNavigate();
  const { itens, subtotal, limpar } = useCart();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const [tipoEntrega, setTipoEntrega] = useState("RETIRADA");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [complemento, setComplemento] = useState("");
  const [referencia, setReferencia] = useState("");

  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [trocoPara, setTrocoPara] = useState("");
  const [observacao, setObservacao] = useState("");

  const [enviando, setEnviando] = useState(false);

  const total = useMemo(() => subtotal, [subtotal]);

  async function localizarOuCriarCliente() {
    const { data: clientes } = await api.get("/clientes");

    const existente = clientes.find(
      (c) => c.telefone.replace(/\D/g, "") === telefone.replace(/\D/g, "")
    );

    const dadosCliente = {
      nome,
      telefone,
      rua: tipoEntrega === "DELIVERY" ? rua : undefined,
      numero: tipoEntrega === "DELIVERY" ? numero : undefined,
      bairro: tipoEntrega === "DELIVERY" ? bairro : undefined,
      cidade: tipoEntrega === "DELIVERY" ? cidade : undefined,
      complemento: tipoEntrega === "DELIVERY" ? complemento : undefined,
      referencia: tipoEntrega === "DELIVERY" ? referencia : undefined,
    };

    if (existente) {
      const { data: atualizado } = await api.put(
        `/clientes/${existente.id}`,
        { ...dadosCliente, telefone: existente.telefone }
      );

      return atualizado.id || existente.id;
    }

    const { data: novo } = await api.post("/clientes", dadosCliente);
    return novo.id;
  }

  async function finalizarPedido() {
    if (!nome.trim() || !telefone.trim()) {
      alert("Preencha seu nome e telefone.");
      return;
    }

    if (tipoEntrega === "DELIVERY" && (!rua.trim() || !bairro.trim())) {
      alert("Preencha o endereço de entrega.");
      return;
    }

    if (itens.length === 0) {
      alert("Seu carrinho está vazio.");
      navigate("/cliente");
      return;
    }

    setEnviando(true);

    try {
      const clienteId = await localizarOuCriarCliente();

      const { data: pedido } = await api.post("/pedidos", {
        clienteId,
        formaPagamento,
        tipoEntrega,
        trocoPara:
          formaPagamento === "DINHEIRO" && trocoPara
            ? Number(trocoPara)
            : undefined,
        observacao: observacao || undefined,
        itens: itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          opcaoPonto: item.opcaoPonto || undefined,
          observacao: item.observacao || undefined,
          adicionaisIds: item.adicionaisIds?.length
            ? item.adicionaisIds
            : undefined,
        })),
      });

      limpar();
      navigate(`/cliente/pedido/${pedido.id}`);
    } catch (erro) {
      console.error(erro);
      alert(
        erro.response?.data?.erro ||
          "Erro ao finalizar o pedido. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button onClick={() => navigate("/cliente/carrinho")}>
          <ArrowLeft size={20} />
        </button>

        <h1>Finalizar pedido</h1>
      </header>

      <section className="checkout-section">
        <h2>Seus dados</h2>

        <label>
          Nome completo
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>

        <label>
          Telefone / WhatsApp
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </label>
      </section>

      <section className="checkout-section">
        <h2>Entrega</h2>

        <div className="opcoes-entrega">
          <button
            type="button"
            className={tipoEntrega === "RETIRADA" ? "ativa" : ""}
            onClick={() => setTipoEntrega("RETIRADA")}
          >
            Retirar no balcão
          </button>

          <button
            type="button"
            className={tipoEntrega === "DELIVERY" ? "ativa" : ""}
            onClick={() => setTipoEntrega("DELIVERY")}
          >
            Delivery
          </button>
        </div>

        {tipoEntrega === "DELIVERY" && (
          <div className="endereco-grid">
            <label className="full">
              Rua
              <input value={rua} onChange={(e) => setRua(e.target.value)} />
            </label>

            <label>
              Número
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </label>

            <label>
              Bairro
              <input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </label>

            <label>
              Cidade
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </label>

            <label>
              Complemento
              <input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </label>

            <label className="full">
              Ponto de referência
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      <section className="checkout-section">
        <h2>Pagamento</h2>

        <div className="opcoes-pagamento">
          {["PIX", "DINHEIRO", "CREDITO", "DEBITO"].map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={formaPagamento === opcao ? "ativa" : ""}
              onClick={() => setFormaPagamento(opcao)}
            >
              {opcao}
            </button>
          ))}
        </div>

        {formaPagamento === "DINHEIRO" && (
          <label>
            Troco para quanto?
            <input
              type="number"
              value={trocoPara}
              onChange={(e) => setTrocoPara(e.target.value)}
              placeholder="Opcional"
            />
          </label>
        )}
      </section>

      <section className="checkout-section">
        <h2>Observações</h2>

        <textarea
          rows="3"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex.: sem cebola, ponto da carne, etc."
        />
      </section>

      <div className="checkout-resumo">
        <span>Total</span>
        <b>{money.format(total)}</b>
      </div>

      <button
        className="btn-finalizar"
        disabled={enviando}
        onClick={finalizarPedido}
      >
        {enviando ? "Enviando pedido..." : "Confirmar Pedido"}
      </button>
    </div>
  );
}
