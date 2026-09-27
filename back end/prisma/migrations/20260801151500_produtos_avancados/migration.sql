ALTER TABLE "Produto" ADD COLUMN "imagemUrl" TEXT;
ALTER TABLE "Produto" ADD COLUMN "ingredientes" TEXT;
ALTER TABLE "Produto" ADD COLUMN "sabores" TEXT;
ALTER TABLE "Produto" ADD COLUMN "disponivel" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Adicional" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "produtoId" INTEGER NOT NULL,
    CONSTRAINT "Adicional_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Adicional" ADD CONSTRAINT "Adicional_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
