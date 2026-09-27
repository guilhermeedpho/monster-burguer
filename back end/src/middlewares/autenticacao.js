/**
 * Middleware de autenticação: exige um JWT válido no header
 * Authorization: Bearer <token>. Usado como preHandler nas rotas
 * administrativas — tudo que envolve dado pessoal de cliente
 * (nome, WhatsApp, endereço) ou operação da loja (caixa, produtos,
 * pedidos) exige login.
 */
export async function exigirAutenticacao(request, reply) {
  try {
    const payload = await request.jwtVerify();

    request.usuario = {
      id: payload.sub,
      papel: payload.papel,
    };
  } catch {
    return reply.code(401).send({
      erro: "Não autenticado. Faça login novamente.",
      requestId: request.id,
    });
  }
}

/** Exige, além de autenticado, que o papel seja ADMIN. */
export async function exigirAdmin(request, reply) {
  await exigirAutenticacao(request, reply);

  if (reply.sent) return; // exigirAutenticacao já respondeu com 401

  if (request.usuario.papel !== "ADMIN") {
    return reply.code(403).send({
      erro: "Só administradores podem fazer isso.",
      requestId: request.id,
    });
  }
}
