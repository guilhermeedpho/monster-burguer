import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, Mail, UserPlus, UserRound } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth();

  const [modo, setModo] = useState("entrar"); // entrar | criar-primeiro-acesso

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoEntrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await entrar(email, senha);
      navigate("/");
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao entrar.");
    } finally {
      setCarregando(false);
    }
  }

  async function aoCriarPrimeiroAcesso(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await api.post("/auth/bootstrap", { nome, email, senha });
      await entrar(email, senha);
      navigate("/");
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao criar acesso.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo-monster-burgers.png" alt="Monster Burgers" />

        <h1>Painel de Gestão</h1>

        <form onSubmit={aoEntrar} style={{ display: modo === "entrar" ? "flex" : "none" }}>
          <label>
            <Mail size={15} />
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <Lock size={15} />
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          {modo === "entrar" && erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            <LogIn size={16} />
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            className="login-secundario"
            onClick={() => {
              setErro("");
              setModo("criar-primeiro-acesso");
            }}
          >
            Ainda não tenho acesso
          </button>
        </form>

        <form
          onSubmit={aoCriarPrimeiroAcesso}
          style={{ display: modo === "criar-primeiro-acesso" ? "flex" : "none" }}
        >
          <p className="login-aviso">
            Isso só funciona uma vez — pra criar o primeiro administrador
            do sistema. Depois disso, peça pra ele criar seu acesso.
          </p>

          <label>
            <UserRound size={15} />
            Seu nome
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          <label>
            <Mail size={15} />
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <Lock size={15} />
            Senha (mínimo 8 caracteres)
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          {modo === "criar-primeiro-acesso" && erro && (
            <p className="login-erro">{erro}</p>
          )}

          <button type="submit" disabled={carregando}>
            <UserPlus size={16} />
            {carregando ? "Criando..." : "Criar acesso"}
          </button>

          <button
            type="button"
            className="login-secundario"
            onClick={() => {
              setErro("");
              setModo("entrar");
            }}
          >
            Já tenho acesso
          </button>
        </form>
      </div>
    </div>
  );
}
