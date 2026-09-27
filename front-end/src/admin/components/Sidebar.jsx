import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Banknote,
  UtensilsCrossed,
  FolderKanban,
  Users,
  ChartNoAxesCombined,
  Settings,
  Package,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";
import logo from "../assets/logo.png";

const items = [
  {
    to: "/",
    label: "Visão Geral",
    icon: LayoutDashboard,
  },
  {
    to: "/pedidos",
    label: "Pedidos",
    icon: ClipboardList,
  },
{
  to: "/cozinha",
  label: "Cozinha",
  icon: ChefHat,
},
  {
    to: "/caixa",
    label: "Caixa",
    icon: Banknote,
  },
  {
    to: "/produtos",
    label: "Cardápio",
    icon: UtensilsCrossed,
  },
  {
    to: "/categorias",
    label: "Categorias",
    icon: FolderKanban,
  },
  {
    to: "/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    to: "/relatorios",
    label: "Relatórios",
    icon: ChartNoAxesCombined,
  },
];

export default function Sidebar() {
  const { usuario, sair } = useAuth();

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="logo-frame">

          <img
            src={logo}
            alt="Monster Burgers"
            className="logo-img"
          />

        </div>

        <span className="painel-title">
          PAINEL DE GESTÃO
        </span>

      </div>

      <nav className="sidebar-nav">

        <p className="nav-label">
          GERENCIAMENTO
        </p>

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
            >
              <Icon
                size={20}
                strokeWidth={2.2}
              />

              <span>{item.label}</span>

            </NavLink>
          );
        })}

      </nav>

      <div className="sidebar-bottom">

        <NavLink to="/configuracoes">

          <Settings size={20} />

          <span>Configurações</span>

        </NavLink>

        <div className="store-status">

          <Package size={16} />

          <span>Loja aberta</span>

          <i></i>

        </div>

        {usuario && (
          <button
            type="button"
            className="botao-sair"
            onClick={sair}
            title={usuario.email}
          >
            <LogOut size={16} />
            <span>Sair ({usuario.nome.split(" ")[0]})</span>
          </button>
        )}

      </div>

    </aside>
  );
}