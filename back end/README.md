# Monster Burguer — API

Back-end da hamburgueria Monster Burguer. Fastify + Prisma + PostgreSQL + Socket.IO.

## Rodando localmente

1. Instale as dependências:
   ```
   npm install
   ```

2. Copie `.env` e ajuste `DATABASE_URL` pro seu PostgreSQL local.

3. Aplique as migrations:
   ```
   npx prisma migrate dev
   ```

4. Suba o servidor:
   ```
   npm run dev
   ```

A API sobe em `http://localhost:3000`.

## Primeiro acesso (login do admin)

Não existe usuário padrão — o primeiro administrador é criado pela própria
tela de login do front-end (opção "Ainda não tenho acesso"), que chama
`POST /auth/bootstrap`. Isso só funciona **uma vez**: depois que o primeiro
admin existe, novos acessos só podem ser criados por alguém já logado
(`POST /auth/usuarios`).

## Testes

```
npm test
```

Roda os testes de regressão da lógica de cálculo de pedido (preço, adicionais, desconto, taxa de entrega) com o test runner nativo do Node — não precisa instalar nada extra.

## Variáveis de ambiente (`.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Connection string do PostgreSQL |
| `JWT_SECRET` | sim | Segredo pra assinar os tokens de login. Gere com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `FRONTEND_URL` | não | URL(s) do front-end liberadas no CORS, separadas por vírgula. Padrão: `localhost:5173`/`5174` |
| `NODE_ENV` | não | `development` ou `production` |
| `LOG_QUERIES` | não | `true` pra logar todas as queries SQL mesmo em produção |
| `ALERT_ERROR_RATE_THRESHOLD` | não | Taxa de erro (0 a 1) que dispara alerta. Padrão `0.2` |
| `ALERT_WEBHOOK_URL` | não | Webhook (Slack/Discord) pra receber alertas |
| `PORT` | não | Porta do servidor. Padrão `3000` |

## Segurança de dados pessoais

- Rotas que expõem lista/detalhe de clientes, produtos/categorias em
  escrita, caixa, pedidos (lista/status) e upload exigem login
  (`Authorization: Bearer <token>`).
- Só ficam públicas as rotas que o cliente final precisa sem login:
  ver cardápio (`GET /produtos`, `/categorias`), se cadastrar
  (`POST /clientes/registrar` — só altera o próprio cadastro, nunca o
  de outro cliente), criar pedido (`POST /pedidos`) e acompanhar o
  próprio pedido (`GET /pedidos/rastrear/:codigo`, usando um código
  não sequencial — nunca o id interno).
- O Socket.IO usa salas: a cozinha recebe todo evento, mas cada cliente
  só recebe atualização do próprio pedido.
- Nenhum dado pessoal (nome, telefone, endereço, senha) é gravado nos
  logs — só os campos não sensíveis.

## Observabilidade

- `GET /health` — status da API, banco e Socket.IO.
- `GET /metrics` — latência, taxa de erro, throughput, cache hit/miss, memória/CPU.
- Toda resposta traz o header `x-request-id`, útil pra rastrear uma requisição específica nos logs.
- Logs em JSON estruturado (via Fastify/pino).

## Estrutura

```
src/
  controllers/   validação de entrada (zod) + chamada aos services
  services/      regras de negócio e acesso ao banco (Prisma)
  routes/        definição das rotas Fastify
  middlewares/   segurança (helmet, rate limit) e observabilidade
  utils/         cache em memória, métricas
  socket/        Socket.IO (eventos em tempo real pra cozinha/cliente)
prisma/
  schema.prisma  modelo do banco
  migrations/    histórico de migrations
```

## CI

O workflow em `.github/workflows/ci.yml` sobe um PostgreSQL de teste, aplica as migrations e roda `npm test` a cada push/PR na `main`.
