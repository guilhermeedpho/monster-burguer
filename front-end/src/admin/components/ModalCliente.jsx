import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ModalCliente({
  aberto,
  fechar,
  atualizarClientes,
  cliente,
}) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    whatsapp: "",
    email: "",
    cpf: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    referencia: "",
    observacao: "",
  });

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome || "",
        telefone: cliente.telefone || "",
        whatsapp: cliente.whatsapp || "",
        email: cliente.email || "",
        cpf: cliente.cpf || "",
        cep: cliente.cep || "",
        rua: cliente.rua || "",
        numero: cliente.numero || "",
        complemento: cliente.complemento || "",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "",
        estado: cliente.estado || "",
        referencia: cliente.referencia || "",
        observacao: cliente.observacao || "",
      });
    } else {
      limparFormulario();
    }
  }, [cliente]);

  function limparFormulario() {
    setForm({
      nome: "",
      telefone: "",
      whatsapp: "",
      email: "",
      cpf: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      referencia: "",
      observacao: "",
    });
  }

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function salvarCliente() {
    try {
      if (cliente) {
        await api.put(`/clientes/${cliente.id}`, form);
        alert("Cliente atualizado com sucesso!");
      } else {
        await api.post("/clientes", form);
        alert("Cliente cadastrado com sucesso!");
      }

      atualizarClientes();
      fechar();
      limparFormulario();

    } catch (error) {
      console.error("Erro completo:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Resposta:", error.response.data);

        alert(
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert(error.message);
      }
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>
          {cliente ? "Editar Cliente" : "Novo Cliente"}
        </h2>

        <div className="campo">
          <label>Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Telefone</label>
          <input
            name="telefone"
            value={form.telefone}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>WhatsApp</label>
          <input
            name="whatsapp"
            value={form.whatsapp}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>E-mail</label>
          <input
            name="email"
            value={form.email}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>CPF</label>
          <input
            name="cpf"
            value={form.cpf}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>CEP</label>
          <input
            name="cep"
            value={form.cep}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Rua</label>
          <input
            name="rua"
            value={form.rua}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Número</label>
          <input
            name="numero"
            value={form.numero}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Complemento</label>
          <input
            name="complemento"
            value={form.complemento}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Bairro</label>
          <input
            name="bairro"
            value={form.bairro}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Cidade</label>
          <input
            name="cidade"
            value={form.cidade}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Estado</label>
          <input
            name="estado"
            value={form.estado}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Referência</label>
          <input
            name="referencia"
            value={form.referencia}
            onChange={alterarCampo}
          />
        </div>

        <div className="campo">
          <label>Observação</label>
          <textarea
            rows="3"
            name="observacao"
            value={form.observacao}
            onChange={alterarCampo}
          />
        </div>

        <div className="acoes">
          <button onClick={fechar}>
            Cancelar
          </button>

          <button onClick={salvarCliente}>
            {cliente ? "Atualizar" : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}