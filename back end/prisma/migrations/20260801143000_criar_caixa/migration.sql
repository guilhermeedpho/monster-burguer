CREATE TABLE "Caixa" (
    "id" SERIAL NOT NULL,
    "saldoInicial" DOUBLE PRECISION NOT NULL,
    "saldoFinal" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoEm" TIMESTAMP(3),

    CONSTRAINT "Caixa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MovimentacaoCaixa" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caixaId" INTEGER NOT NULL,

    CONSTRAINT "MovimentacaoCaixa_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MovimentacaoCaixa" ADD CONSTRAINT "MovimentacaoCaixa_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
