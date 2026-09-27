import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./admin/context/AuthContext";
import RotaProtegida from "./admin/components/RotaProtegida";
import MainLayout from "./admin/layouts/MainLayout";

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Pedidos from "./admin/pages/Pedidos";
import NovoPedido from "./admin/pages/NovoPedido";
import Produtos from "./admin/pages/Produtos";
import Categorias from "./admin/pages/Categorias";
import Clientes from "./admin/pages/Clientes";
import Relatorios from "./admin/pages/Relatorios";
import Configuracoes from "./admin/pages/Configuracoes";
import Cozinha from "./admin/pages/Cozinha";
import Caixa from "./admin/pages/Caixa";

import AppCliente from "./clientes/app/AppCliente";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/cliente/*" element={<AppCliente />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <RotaProtegida>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pedidos" element={<Pedidos />} />
                  <Route path="/pedidos/novo" element={<NovoPedido />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/categorias" element={<Categorias />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/cozinha" element={<Cozinha />} />
                  <Route path="/caixa" element={<Caixa />} />
                </Routes>
              </MainLayout>
            </RotaProtegida>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
