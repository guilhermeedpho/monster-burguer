/*
  Warnings:

  - You are about to drop the column `endereco` on the `Cliente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "endereco",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "referencia" TEXT,
ADD COLUMN     "rua" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "formaPagamento" TEXT,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "tipoEntrega" TEXT,
ADD COLUMN     "trocoPara" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");
