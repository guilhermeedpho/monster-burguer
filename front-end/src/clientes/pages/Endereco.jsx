import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Store, Truck } from "lucide-react";

import { useCliente } from "../context/ClienteContext";
import PassoHeader from "../components/PassoHeader";
import "../styles/formularioPasso.css";

export default function Endereco() {
  const navigate = useNavigate();
  const { dados, atualizarDados, setEnderecoFeito } = useCliente();

  const [tipoEntrega, setTipoEntrega] = useState(dados.tipoEntrega);
  const [rua, setRua] = useState(dados.rua);
  const [numero, setNumero] = useState(dados.numero);
  const [bairro, setBairro] = useState(dados.bairro);
  const [cidade, setCidade] = useState(dados.cidade);
  const [complemento, setComplemento] = useState(dados.complemento);
  const [referencia, setReferencia] = useState(dados.referencia);

  function continuar() {
    if (tipoEntrega === "DELIVERY" && (!rua.trim() || !bairro.trim())) {
      alert("Preencha ao menos a rua e o bairro pra entrega.");
      return;
    }

    atualizarDados({
      tipoEntrega,
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      complemento: complemento.trim(),
      referencia: referencia.trim(),
    });

    setEnderecoFeito(true);
    navigate("/cliente/cardapio");
  }

  return (
    <div className="passo-page">
      <PassoHeader
        passo={2}
        titulo="Onde entregamos?"
        subtitulo="Escolha retirar no balcão ou receber em casa."
        voltarPara="/cliente"
      />

      <div className="passo-form">
        <div className="opcoes-entrega">
          <button
            type="button"
            className={tipoEntrega === "RETIRADA" ? "ativa" : ""}
            onClick={() => setTipoEntrega("RETIRADA")}
          >
            <Store size={16} />
            Retirar no balcão
          </button>

          <button
            type="button"
            className={tipoEntrega === "DELIVERY" ? "ativa" : ""}
            onClick={() => setTipoEntrega("DELIVERY")}
          >
            <Truck size={16} />
            Receber em casa
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
              <input value={numero} onChange={(e) => setNumero(e.target.value)} />
            </label>

            <label>
              Bairro
              <input value={bairro} onChange={(e) => setBairro(e.target.value)} />
            </label>

            <label>
              Cidade
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </label>

            <label>
              Complemento
              <input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto, bloco... (opcional)"
              />
            </label>

            <label className="full">
              Ponto de referência
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Opcional"
              />
            </label>
          </div>
        )}

        {tipoEntrega === "RETIRADA" && (
          <p className="passo-aviso">
            Seu pedido vai te esperar prontinho no balcão da loja. A gente te
            avisa pelo WhatsApp assim que estiver pronto.
          </p>
        )}
      </div>

      <button className="btn-continuar" onClick={continuar}>
        Ver o cardápio
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
