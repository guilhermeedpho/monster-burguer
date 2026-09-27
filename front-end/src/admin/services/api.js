import axios from "axios";

const CHAVE_TOKEN = "monster-burguer:token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Anexa o token de login em toda requisição, se existir.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Se o token expirou/é inválido, desloga e manda pra tela de login.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem(CHAVE_TOKEN);
      window.location.href = "/login";
    }

    return Promise.reject(erro);
  }
);
