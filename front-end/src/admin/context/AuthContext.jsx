import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { socket } from "../services/socket";

const AuthContext = createContext(null);

const CHAVE_TOKEN = "monster-burguer:token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CHAVE_TOKEN));
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) {
      socket.disconnect();
      setCarregando(false);
      return;
    }

    socket.auth = { token };
    if (!socket.connected) socket.connect();

    api
      .get("/auth/eu")
      .then(({ data }) => setUsuario(data.usuario))
      .catch(() => {
        // Token expirado/inválido — desloga
        localStorage.removeItem(CHAVE_TOKEN);
        setToken(null);
      })
      .finally(() => setCarregando(false));
  }, [token]);

  async function entrar(email, senha) {
    const { data } = await api.post("/auth/login", { email, senha });

    localStorage.setItem(CHAVE_TOKEN, data.token);
    socket.auth = { token: data.token };
    if (!socket.connected) socket.connect();
    setToken(data.token);
    setUsuario(data.usuario);
  }

  function sair() {
    localStorage.removeItem(CHAVE_TOKEN);
    socket.disconnect();
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        autenticado: Boolean(token),
        carregando,
        entrar,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider.");
  }

  return contexto;
}
