import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileTypeFromFile } from "file-type";

import { UPLOADS_DIR } from "../utils/caminhoUploads.js";

const TIPOS_PERMITIDOS = {
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
    await pipeline(
      arquivo.file,
      fs.createWriteStream(destinoTemporario)
    );

    // @fastify/multipart marca "truncated" quando
    // o arquivo passa do limite configurado.
    if (arquivo.file.truncated) {
      fs.unlinkSync(destinoTemporario);

      return reply.code(413).send({
        erro: "Imagem muito grande. O limite é 5MB.",
        requestId: request.id,
      });
    }

    // Verifica o conteúdo real do arquivo,
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

    const extensao = TIPOS_PERMITIDOS[tipoReal.ext];

    const nomeArquivo = `${randomUUID()}${extensao}`;

    const destinoFinal = path.join(
      UPLOADS_DIR,
      nomeArquivo
    );

    fs.renameSync(destinoTemporario, destinoFinal);

    const baseUrl = `${request.protocol}://${request.headers.host}`;

    return {
      url: `${baseUrl}/uploads/${nomeArquivo}`,
    };
  } catch (erro) {
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