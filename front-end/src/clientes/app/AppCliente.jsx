import { Routes, Route } from "react-router-dom";

import { CartProvider } from "../context/CartContext";
import { ClienteProvider } from "../context/ClienteContext";

import Cadastro from "../pages/Cadastro";
import Endereco from "../pages/Endereco";
import Home from "../pages/Home";
import Carrinho from "../pages/Carrinho";
import Pagamento from "../pages/Pagamento";
import Confirmacao from "../pages/Confirmacao";

export default function AppCliente() {
  return (
    <ClienteProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Cadastro />} />
          <Route path="/endereco" element={<Endereco />} />
          <Route path="/cardapio" element={<Home />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/pedido/:codigo" element={<Confirmacao />} />
        </Routes>
      </CartProvider>
    </ClienteProvider>
  );
}
