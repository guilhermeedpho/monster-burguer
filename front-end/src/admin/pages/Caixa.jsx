import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Lock,
  RotateCcw,
  Unlock,
  Wallet,
  X,
} from "lucide-react";

import { api } from "../services/api";
import "../styles/caixa.css";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Caixa() {
  const [caixa, setCaixa] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [modalAbrir, setModalAbrir] = useState(false);
  const [modalMovimento, setModalMovimento] = useState(null);

  const [saldoInicial, setSaldoInicial] = useState("");
  const [valorMovimento, setValorMovimento] = useState("");
  const [descricaoMovimento, setDescricaoMovimento] = useState("");

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);

    try {
      const [{ data: atual }, { data: hist }] = await Promise.all([
        api.get("/caixa/atual"),
        api.get("/caixa/historico"),
      ]);

      setCaixa(atual);
      setHistorico(hist);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  }

  async function abrirCaixa() {
    if (!saldoInicial) {
      alert("Informe o saldo inicial.");
      return;
    }

    try {
      await api.post("/caixa/abrir", {
        saldoInicial: Number(saldoInicial),
      });

      setSaldoInicial("");
      setModalAbrir(false);
      carregarTudo();
    } catch (erro) {
      console.error(erro);
      alert(erro.response?.data?.erro || "Erro ao abrir o caixa.");
    }
  }

  async function fecharCaixa() {
    if (!confirm("Deseja fechar o caixa agora?")) return;

    try {
      await api.post(`/caixa/${caixa.id}/fechar`);
      carregarTudo();
    } catch (erro) {
      console.error(erro);
      alert(erro.response?.data?.erro || "Erro ao fechar o caixa.");
    }
  }

  async function zerarCaixa() {
    if (
      !confirm(
        "Isso fecha o caixa atual e abre um novo já zerado (saldo inicial R$ 0,00). Confirma?"
      )
    ) {
      return;
    }

    try {
      if (caixa) {
        await api.post(`/caixa/${caixa.id}/fechar`);
      }

      await api.post("/caixa/abrir", { saldoInicial: 0 });
      carregarTudo();
    } catch (erro) {
      console.error(erro);
      alert(erro.response?.data?.erro || "Erro ao zerar o caixa.");
    }
  }

  async function registrarMovimento() {
    if (!valorMovimento) {
      alert("Informe o valor da movimentação.");
      return;
    }

    try {
      await api.post(`/caixa/${caixa.id}/movimentacoes`, {
        tipo: modalMovimento,
        valor: Number(valorMovimento),
        descricao: descricaoMovimento || undefined,
      });

      setValorMovimento("");
      setDescricaoMovimento("");
      setModalMovimento(null);
      carregarTudo();
    } catch (erro) {
      console.error(erro);
      alert(erro.response?.data?.erro || "Erro ao registrar movimentação.");
    }
  }

  if (carregando) {
    return (
      <section className="cash-page">
        <p>Carregando...</p>
      </section>
    );
  }

  const entradas = (caixa?.movimentacoes || []).filter(
    (m) => m.tipo !== "SANGRIA"
  );
  const saidas = (caixa?.movimentacoes || []).filter(
    (m) => m.tipo === "SANGRIA"
  );

  return (
    <section className="cash-page">
      <div className="cash-heading">
        <div>
          <p className="eyebrow">FINANCEIRO</p>
          <h1>Caixa</h1>
          <p>Controle de entradas e saídas do caixa da loja.</p>
        </div>

        <div className="cash-heading-acoes">
          {caixa && (
            <button className="reset-cash" onClick={zerarCaixa}>
              <RotateCcw size={16} />
              Zerar caixa
            </button>
          )}

          {caixa ? (
            <button className="close-cash" onClick={fecharCaixa}>
              <Lock size={16} />
              Fechar caixa
            </button>
          ) : (
            <button className="open-cash" onClick={() => setModalAbrir(true)}>
              <Unlock size={16} />
              Abrir caixa
            </button>
          )}
        </div>
      </div>

      {!caixa ? (
        <div className="closed-cash">
          <Wallet size={40} />
          <h2>Nenhum caixa aberto</h2>
          <p>
            Abra o caixa para começar a registrar entradas e saídas do dia.
          </p>

          <button onClick={() => setModalAbrir(true)}>Abrir caixa</button>
        </div>
      ) : (
        <>
          <div className="cash-hero">
            <div>
              <span>SALDO ATUAL</span>
              <h2>{money.format(caixa.saldoAtual)}</h2>
              <p>
                Aberto em{" "}
                {new Date(caixa.abertoEm).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="cash-hero-actions">
              <button onClick={() => setModalMovimento("RECEBIMENTO")}>
                <ArrowUpCircle size={16} />
                Recebimento
              </button>

              <button onClick={() => setModalMovimento("SUPRIMENTO")}>
                <ArrowUpCircle size={16} />
                Suprimento
              </button>

              <button onClick={() => setModalMovimento("SANGRIA")}>
                <ArrowDownCircle size={16} />
                Sangria
              </button>
            </div>
          </div>

          <div className="cash-metrics">
            <div className="cash-metric yellow">
              <span>
                <Banknote size={18} />
              </span>
              <p>Saldo inicial</p>
              <b>{money.format(caixa.saldoInicial)}</b>
            </div>

            <div className="cash-metric green">
              <span>
                <ArrowUpCircle size={18} />
              </span>
              <p>Entradas</p>
              <b>
                {money.format(
                  entradas.reduce((s, m) => s + Number(m.valor), 0)
                )}
              </b>
            </div>

            <div className="cash-metric red">
              <span>
                <ArrowDownCircle size={18} />
              </span>
              <p>Sangrias</p>
              <b>
                {money.format(
                  saidas.reduce((s, m) => s + Number(m.valor), 0)
                )}
              </b>
            </div>

            <div className="cash-metric blue">
              <span>
                <Wallet size={18} />
              </span>
              <p>Movimentações</p>
              <b>{caixa.movimentacoes?.length || 0}</b>
            </div>
          </div>

          <div className="movement-panel">
            <div className="movement-head">
              <div>
                <h2>Movimentações</h2>
                <p>Histórico do caixa aberto</p>
              </div>
            </div>

            {(caixa.movimentacoes || []).length === 0 ? (
              <p className="no-movements">Nenhuma movimentação registrada.</p>
            ) : (
              caixa.movimentacoes.map((mov) => (
                <div className="movement" key={mov.id}>
                  <span className={mov.tipo}>
                    {mov.tipo === "SANGRIA" ? (
                      <ArrowDownCircle size={16} />
                    ) : (
                      <ArrowUpCircle size={16} />
                    )}
                  </span>

                  <div>
                    <b>{mov.descricao || mov.tipo}</b>
                    <p>
                      {new Date(mov.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <strong className={mov.tipo === "SANGRIA" ? "negative" : ""}>
                    {mov.tipo === "SANGRIA" ? "-" : "+"}
                    {money.format(mov.valor)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <div className="cash-history">
        <h2>Histórico de caixas</h2>
        <p>Últimos fechamentos registrados.</p>

        <div>
          {historico
            .filter((h) => h.status === "FECHADO")
            .slice(0, 6)
            .map((h) => (
              <article key={h.id}>
                <span>
                  {new Date(h.abertoEm).toLocaleDateString("pt-BR")}
                </span>
                <p>Saldo final</p>
                <b>{money.format(h.saldoAtual || 0)}</b>
              </article>
            ))}
        </div>
      </div>

      {modalAbrir && (
        <div className="cash-modal-backdrop" onClick={() => setModalAbrir(false)}>
          <div className="cash-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="cash-modal-close"
              onClick={() => setModalAbrir(false)}
            >
              <X size={16} />
            </button>

            <h2>Abrir caixa</h2>
            <p>Informe o valor inicial em dinheiro no caixa.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                abrirCaixa();
              }}
            >
              <label>
                Saldo inicial (R$)
                <input
                  type="number"
                  autoFocus
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                />
              </label>

              <button type="submit">Abrir caixa</button>
            </form>
          </div>
        </div>
      )}

      {modalMovimento && (
        <div
          className="cash-modal-backdrop"
          onClick={() => setModalMovimento(null)}
        >
          <div className="cash-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="cash-modal-close"
              onClick={() => setModalMovimento(null)}
            >
              <X size={16} />
            </button>

            <h2>
              {modalMovimento === "SANGRIA"
                ? "Registrar sangria"
                : modalMovimento === "SUPRIMENTO"
                ? "Registrar suprimento"
                : "Registrar recebimento"}
            </h2>

            <p>Preencha os dados da movimentação.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                registrarMovimento();
              }}
            >
              <label>
                Valor (R$)
                <input
                  type="number"
                  autoFocus
                  value={valorMovimento}
                  onChange={(e) => setValorMovimento(e.target.value)}
                />
              </label>

              <label>
                Descrição (opcional)
                <input
                  type="text"
                  value={descricaoMovimento}
                  onChange={(e) => setDescricaoMovimento(e.target.value)}
                />
              </label>

              <button type="submit">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
