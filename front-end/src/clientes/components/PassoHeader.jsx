import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/passoHeader.css";

export default function PassoHeader({ passo, total = 5, titulo, subtitulo, voltarPara }) {
  const navigate = useNavigate();

  return (
    <header className="passo-header">
      {voltarPara && (
        <button className="passo-voltar" onClick={() => navigate(voltarPara)}>
          <ArrowLeft size={18} />
        </button>
      )}

      <div className="passo-numero">
        {passo}/{total}
      </div>

      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>

      <div className="passo-barra">
        {Array.from({ length: total }).map((_, indice) => (
          <span
            key={indice}
            className={indice < passo ? "preenchida" : ""}
          />
        ))}
      </div>
    </header>
  );
}
