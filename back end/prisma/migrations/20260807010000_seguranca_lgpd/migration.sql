-- Garante gen_random_uuid() disponível mesmo em Postgres mais antigo
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'ADMIN',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AlterTable: adiciona a coluna sem default fixo, preenche os
-- registros existentes com um UUID gerado, e só então aplica a
-- restrição de unicidade (senão a migration falha se já existir
-- algum pedido cadastrado no banco).
ALTER TABLE "Pedido" ADD COLUMN "codigoAcompanhamento" TEXT;

UPDATE "Pedido" SET "codigoAcompanhamento" = gen_random_uuid()::text
WHERE "codigoAcompanhamento" IS NULL;

ALTER TABLE "Pedido" ALTER COLUMN "codigoAcompanhamento" SET NOT NULL;

CREATE UNIQUE INDEX "Pedido_codigoAcompanhamento_key" ON "Pedido"("codigoAcompanhamento");
