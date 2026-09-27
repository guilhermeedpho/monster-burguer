import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("Erro capturado pelo ErrorBoundary:", erro, info);
  }

  render() {
    if (this.state.erro) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "monospace",
            background: "#1a1a1a",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ color: "#ff6b6b", fontSize: 20 }}>
              Algo quebrou nesta tela
            </h1>

            <p style={{ opacity: 0.8, fontSize: 13 }}>
              Copie o texto abaixo e mande pra quem está cuidando do sistema:
            </p>

            <pre
              style={{
                background: "#111",
                padding: 14,
                borderRadius: 8,
                overflow: "auto",
                fontSize: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {String(this.state.erro?.stack || this.state.erro)}
            </pre>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 14,
                padding: "10px 18px",
                background: "#f7b718",
                color: "#161204",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
              }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
