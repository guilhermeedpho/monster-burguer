import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RotaProtegida({ children }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return null; // evita "piscar" a tela de login antes de confirmar o token
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
