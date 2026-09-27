# Monster Burguer — Front-end

React + Vite. Duas áreas:

- `/` — painel administrativo (cozinha, pedidos, produtos, categorias, clientes, caixa, configurações).
- `/cliente` — loja para o cliente final (cardápio, carrinho, checkout, acompanhamento do pedido em tempo real).

## Rodando localmente

1. Instale as dependências:
   ```
   npm install
   ```

2. Copie `.env.example` para `.env` e ajuste `VITE_API_URL` se a API não estiver em `http://localhost:3000`.

3. Suba o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Build de produção

```
npm run build
```

Gera os arquivos estáticos em `dist/`. Antes do deploy, defina `VITE_API_URL` apontando pra API em produção (o front não sabe a URL certa sozinho — precisa vir do ambiente de build).

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL da API (backend). Padrão: `http://localhost:3000` |

## Estrutura

```
src/
  admin/       painel administrativo (pages, components, services, styles)
  clientes/    loja do cliente final (pages, components, context, services, styles)
  App.jsx      rotas raiz
  main.jsx     ponto de entrada
```

## CI

O workflow em `.github/workflows/ci.yml` roda lint + build a cada push/PR na `main`, pra pegar erro de import/sintaxe antes de ir pro ar.
