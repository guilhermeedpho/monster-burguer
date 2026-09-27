import { useEffect, useState } from "react";
import { Clock, Save, Settings, Store, Truck } from "lucide-react";

import "../styles/configuracoes.css";

const CHAVE_STORAGE = "monster-burguer:configuracoes";

const PADRAO = {
  nomeLoja: "Monster Burguer",
  telefone: "",
  whatsapp: "",
  endereco: "",

  abertura: "18:00",
  fechamento: "23:30",
  lojaAberta: true,

  taxaEntregaPadrao: "",
  raioEntregaKm: "",
  aceitaRetirada: true,
  aceitaDelivery: true,
};

export default function Configuracoes() {
  const [config, setConfig] = useState(PADRAO);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) {
        setConfig({ ...PADRAO, ...JSON.parse(salvo) });
      }
    } catch (erro) {
      console.error(erro);
    }
  }, []);

  function alterarCampo(campo, valor) {
    setConfig((atual) => ({ ...atual, [campo]: valor }));
    setSalvo(false);
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(config));
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar configurações.");
    }
  }

  return (
    <section className="settings-page">
      <div className="settings-heading">
        <div>
          <p className="eyebrow">AJUSTES</p>
          <h1>Configurações</h1>
          <p>Informações gerais da loja e regras de funcionamento.</p>
        </div>

        <button onClick={salvar}>
          <Save size={16} />
          {salvo ? "Salvo!" : "Salvar alterações"}
        </button>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-head">
            <span>
              <Store size={18} />
            </span>

            <div>
              <h2>Dados da loja</h2>
              <p>Essas informações aparecem para o cliente.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label className="wide">
              Nome da loja
              <input
                value={config.nomeLoja}
                onChange={(e) => alterarCampo("nomeLoja", e.target.value)}
              />
            </label>

            <label>
              Telefone
              <input
                value={config.telefone}
                onChange={(e) => alterarCampo("telefone", e.target.value)}
              />
            </label>

            <label>
              WhatsApp
              <input
                value={config.whatsapp}
                onChange={(e) => alterarCampo("whatsapp", e.target.value)}
              />
            </label>

            <label className="wide">
              Endereço
              <input
                value={config.endereco}
                onChange={(e) => alterarCampo("endereco", e.target.value)}
              />
            </label>

            <label className="toggle">
              Loja aberta para pedidos
              <input
                type="checkbox"
                checked={config.lojaAberta}
                onChange={(e) =>
                  alterarCampo("lojaAberta", e.target.checked)
                }
              />
              <i />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-head">
            <span>
              <Clock size={18} />
            </span>

            <div>
              <h2>Horário de funcionamento</h2>
              <p>Usado para mostrar se a loja está aberta.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label>
              Abre às
              <input
                type="time"
                value={config.abertura}
                onChange={(e) => alterarCampo("abertura", e.target.value)}
              />
            </label>

            <label>
              Fecha às
              <input
                type="time"
                value={config.fechamento}
                onChange={(e) => alterarCampo("fechamento", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-head">
            <span>
              <Truck size={18} />
            </span>

            <div>
              <h2>Entrega</h2>
              <p>Regras de delivery e retirada.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label>
              Taxa de entrega padrão (R$)
              <input
                type="number"
                value={config.taxaEntregaPadrao}
                onChange={(e) =>
                  alterarCampo("taxaEntregaPadrao", e.target.value)
                }
              />
            </label>

            <label>
              Raio de entrega (km)
              <input
                type="number"
                value={config.raioEntregaKm}
                onChange={(e) =>
                  alterarCampo("raioEntregaKm", e.target.value)
                }
              />
            </label>

            <label className="toggle wide">
              Aceita retirada no balcão
              <input
                type="checkbox"
                checked={config.aceitaRetirada}
                onChange={(e) =>
                  alterarCampo("aceitaRetirada", e.target.checked)
                }
              />
              <i />
            </label>

            <label className="toggle wide">
              Aceita delivery
              <input
                type="checkbox"
                checked={config.aceitaDelivery}
                onChange={(e) =>
                  alterarCampo("aceitaDelivery", e.target.checked)
                }
              />
              <i />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
