import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { useCliente } from "../context/ClienteContext";
import PassoHeader from "../components/PassoHeader";
import "../styles/checkout.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Pagamento() {
  const navigate = useNavigate();
  const { itens, subtotal, limpar } = useCart();
  const { dados, cadastroFeito, enderecoFeito } = useCliente();

  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [trocoPara, setTrocoPara] = useState("");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!cadastroFeito) {
      navigate("/cliente", { replace: true });
    } else if (!enderecoFeito) {
      navigate("/cliente/endereco", { replace: true });
    } else if (itens.length === 0) {
      navigate("/cliente/cardapio", { replace: true });
    }
  }, [cadastroFeito, enderecoFeito, itens.length, navigate]);

  const total = useMemo(() => subtotal, [subtotal]);

  async function localizarOuCriarCliente() {
    const dadosCliente = {
      nome: dados.nome,
      telefone: dados.telefone,
      rua: dados.tipoEntrega === "DELIVERY" ? dados.rua : undefined,
      numero: dados.tipoEntrega === "DELIVERY" ? dados.numero : undefined,
      bairro: dados.tipoEntrega === "DELIVERY" ? dados.bairro : undefined,
      cidade: dados.tipoEntrega === "DELIVERY" ? dados.cidade : undefined,
      complemento: dados.tipoEntrega === "DELIVERY" ? dados.complemento : undefined,
      referencia: dados.tipoEntrega === "DELIVERY" ? dados.referencia : undefined,
    };

    // Endpoint público seguro: encontra/atualiza só o PRÓPRIO cadastro
    // pelo telefone — nunca baixa nem expõe o cadastro de outro cliente.
    const { data: cliente } = await api.post("/clientes/registrar", dadosCliente);
    return cliente.id;
  }

  async function finalizarPedido() {
    setEnviando(true);

    try {
      const clienteId = await localizarOuCriarCliente();

      const { data: pedido } = await api.post("/pedidos", {
        clienteId,
        formaPagamento,
        tipoEntrega: dados.tipoEntrega,
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
      navigate(`/cliente/pedido/${pedido.codigoAcompanhamento}`);
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
      <PassoHeader
        passo={5}
        titulo="Como vai pagar?"
        subtitulo={
          dados.tipoEntrega === "DELIVERY"
            ? `Entrega em: ${dados.rua}, ${dados.numero} — ${dados.bairro}`
            : "Retirada no balcão"
        }
        voltarPara="/cliente/carrinho"
      />

      <section className="checkout-section">
        <h2>Forma de pagamento</h2>

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

        <p className="passo-aviso">
          {formaPagamento === "PIX" && "A chave PIX é enviada no WhatsApp na confirmação."}
          {(formaPagamento === "CREDITO" || formaPagamento === "DEBITO") &&
            "A maquininha vai junto com o entregador (ou te espera no balcão)."}
          {formaPagamento === "DINHEIRO" && "Pagamento em espécie na entrega/retirada."}
        </p>

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
          placeholder="Ex.: interfone quebrado, portão azul, etc."
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
