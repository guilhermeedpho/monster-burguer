import { createContext, useContext, useState } from "react";

const ClienteContext = createContext(null);

const DADOS_INICIAIS = {
  nome: "",
  telefone: "",

  tipoEntrega: "DELIVERY", // DELIVERY | RETIRADA

  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  complemento: "",
  referencia: "",
};

export function ClienteProvider({ children }) {
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [cadastroFeito, setCadastroFeito] = useState(false);
  const [enderecoFeito, setEnderecoFeito] = useState(false);

  function atualizarDados(campos) {
    setDados((atual) => ({ ...atual, ...campos }));
  }

  function reiniciar() {
    setDados(DADOS_INICIAIS);
    setCadastroFeito(false);
    setEnderecoFeito(false);
  }

  return (
    <ClienteContext.Provider
      value={{
        dados,
        atualizarDados,
        cadastroFeito,
        setCadastroFeito,
        enderecoFeito,
        setEnderecoFeito,
        reiniciar,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  const contexto = useContext(ClienteContext);

  if (!contexto) {
    throw new Error("useCliente precisa ser usado dentro de um ClienteProvider.");
  }

  return contexto;
}
