import {
  listarClientes,
  buscarCliente,
  criarCliente,
  registrarPorTelefone,
  atualizarCliente,
  deletarCliente,
} from "../controllers/clienteController.js";

import {
  exigirAutenticacao,
  exigirAdmin,
} from "../middlewares/autenticacao.js";

export async function clienteRoutes(app) {
  // Público: usado pelo checkout do cliente final.
  // Não permite consultar a lista ou os dados completos de outros clientes.
  app.post(
    "/clientes/registrar",
    {
      config: {
        rateLimit: {
          max: 15,
          timeWindow: "1 minute",
        },
      },
    },
    registrarPorTelefone
  );

  // Lista de clientes exige login.
  // Funcionários autenticados podem visualizar a lista.
  app.get(
    "/clientes",
    { preHandler: exigirAutenticacao },
    listarClientes
  );

  // Dados completos de um cliente:
  // somente ADMIN.
  app.get(
    "/clientes/:id",
    { preHandler: exigirAdmin },
    buscarCliente
  );

  // Criar cliente: somente ADMIN.
  app.post(
    "/clientes",
    { preHandler: exigirAdmin },
    criarCliente
  );

  // Atualizar cliente: somente ADMIN.
  app.put(
    "/clientes/:id",
    { preHandler: exigirAdmin },
    atualizarCliente
  );

  // Excluir cliente: somente ADMIN.
  app.delete(
    "/clientes/:id",
    { preHandler: exigirAdmin },
    deletarCliente
  );
}