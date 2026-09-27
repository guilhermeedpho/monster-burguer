import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, UserRound } from "lucide-react";

import { useCliente } from "../context/ClienteContext";
import PassoHeader from "../components/PassoHeader";
import "../styles/formularioPasso.css";

function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { dados, atualizarDados, setCadastroFeito } = useCliente();

  const [nome, setNome] = useState(dados.nome);
  const [telefone, setTelefone] = useState(dados.telefone);

  function continuar() {
    if (!nome.trim()) {
      alert("Digite seu nome.");
      return;
    }

    if (telefone.replace(/\D/g, "").length < 10) {
      alert("Digite um WhatsApp válido, com DDD.");
      return;
    }

    atualizarDados({ nome: nome.trim(), telefone: telefone.trim() });
    setCadastroFeito(true);
    navigate("/cliente/endereco");
  }

  return (
    <div className="passo-page">
      <img
        src="/logo-monster-burgers.png"
        alt="Monster Burgers"
        className="passo-logo"
      />

      <PassoHeader
        passo={1}
        titulo="Vamos começar"
        subtitulo="Como podemos te chamar, e por qual WhatsApp falamos sobre o pedido?"
      />

      <div className="passo-form">
        <label>
          <UserRound size={15} />
          Nome completo

          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </label>

        <label>
          <MessageCircle size={15} />
          WhatsApp

          <input
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="tel"
            maxLength={15}
          />
        </label>

        <p className="passo-aviso">
          Usamos seu WhatsApp só pra falar sobre esse pedido — combinados de
          entrega, atraso ou qualquer dúvida.
        </p>
      </div>

      <button className="btn-continuar" onClick={continuar}>
        Continuar
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
