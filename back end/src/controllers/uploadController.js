import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileTypeFromFile } from "file-type";

import { UPLOADS_DIR } from "../utils/caminhoUploads.js";

const TIPOS_PERMITIDOS = {
  jpg: ".jpg",
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
  gif: ".gif",
};

export async function uploadImagem(request, reply) {
  const arquivo = await request.file();

  if (!arquivo) {
    return reply.code(400).send({
      erro: "Nenhum arquivo enviado.",
      requestId: request.id,
    });
  }

  const nomeTemporario = `${randomUUID()}.tmp`;

  const destinoTemporario = path.join(
    UPLOADS_DIR,
    nomeTemporario
  );

  try {
    // Salva o arquivo temporariamente
    await pipeline(
      arquivo.file,
      fs.createWriteStream(destinoTemporario)
    );

    // Verifica se o arquivo ultrapassou o limite configurado
    if (arquivo.file.truncated) {
      fs.unlinkSync(destinoTemporario);

      return reply.code(413).send({
        erro: "Imagem muito grande. O limite é 5MB.",
        requestId: request.id,
      });
    }

    // Verifica o conteúdo REAL do arquivo
    // e não apenas o MIME informado pelo navegador.
    const tipoReal = await fileTypeFromFile(destinoTemporario);

    if (!tipoReal || !TIPOS_PERMITIDOS[tipoReal.ext]) {
      fs.unlinkSync(destinoTemporario);

      return reply.code(400).send({
        erro:
          "O arquivo enviado não é uma imagem JPG, PNG, WEBP ou GIF válida.",
        requestId: request.id,
      });
    }

    // Define a extensão correta com base no conteúdo real
    const extensao = TIPOS_PERMITIDOS[tipoReal.ext];

    // Gera um nome aleatório para evitar conflitos
    const nomeArquivo = `${randomUUID()}${extensao}`;

    const destinoFinal = path.join(
      UPLOADS_DIR,
      nomeArquivo
    );

    // Move o arquivo temporário para o destino definitivo
    fs.renameSync(
      destinoTemporario,
      destinoFinal
    );

    // Em produção, usa a URL pública do backend.
    // Localmente, usa o endereço da requisição.
    const baseUrl =
      process.env.PUBLIC_API_URL ||
      `${request.protocol}://${request.headers.host}`;

    return {
      url: `${baseUrl}/uploads/${nomeArquivo}`,
    };
  } catch (erro) {
    // Remove o arquivo temporário se algo der errado
    if (fs.existsSync(destinoTemporario)) {
      fs.unlinkSync(destinoTemporario);
    }

    request.log.error(erro);

    return reply.code(500).send({
      erro: "Não foi possível processar a imagem.",
      requestId: request.id,
    });
  }
}