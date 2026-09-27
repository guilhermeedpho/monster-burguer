import { Server } from "socket.io";

let io;

export function iniciarSocket(server, origensPermitidas = "*", verificarToken) {
  io = new Server(server, {
    cors: { origin: origensPermitidas, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("entrar-cozinha", async (token) => {
      try {
        if (typeof token !== "string" || !verificarToken) return;
        const payload = await verificarToken(token);
        if (!["ADMIN", "FUNCIONARIO"].includes(payload.papel)) return;
        socket.join("cozinha");
      } catch {
        // Token inválido: não entra na sala administrativa.
      }
    });

    socket.on("acompanhar-pedido", (codigoAcompanhamento) => {
      if (typeof codigoAcompanhamento === "string" && codigoAcompanhamento.length <= 80) {
        socket.join(`pedido:${codigoAcompanhamento}`);
      }
    });

    socket.on("disconnect", () => console.log("Cliente desconectado:", socket.id));
  });
}

export function getIO() { return io; }
export function notificarCozinha(evento, dados) { getIO()?.to("cozinha").emit(evento, dados); }
export function notificarPedido(codigoAcompanhamento, evento, dados) { getIO()?.to(`pedido:${codigoAcompanhamento}`).emit(evento, dados); }
