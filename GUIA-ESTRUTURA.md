# Monster Burguer — guia simples para alterar o sistema

A ideia deste projeto é: **cada coisa fica no seu lugar**. Assim, quando você mudar uma parte, não precisa mexer no sistema inteiro.

## Front-end

Pasta: `front-end/src`

- `clientes/` → tudo que o cliente da hamburgueria vê.
- `admin/` → painel interno da loja.
- `admin/pages/` → telas completas do painel.
- `admin/components/` → peças reutilizáveis das telas.
- `admin/services/` → comunicação com a API e Socket.IO.
- `admin/context/` → login e estado do administrador.
- `clientes/pages/` → telas do cliente: cardápio, carrinho, endereço, pagamento etc.
- `clientes/components/` → componentes usados pelo cliente.
- `clientes/context/` → carrinho e dados do cliente.
- `clientes/services/` → comunicação do cliente com a API.
- `*/styles/` → CSS de cada área.

### Exemplos

Quer mudar o cardápio do cliente?

`front-end/src/clientes/pages/Home.jsx`

Quer mudar o carrinho?

`front-end/src/clientes/pages/Carrinho.jsx`

Quer mudar a tela da cozinha?

`front-end/src/admin/pages/Cozinha.jsx`

Quer mudar o login?

`front-end/src/admin/pages/Login.jsx`

Quer mudar apenas o visual de uma tela?

Procure o CSS correspondente em `styles/`.

## Back-end

Pasta: `back end/src`

- `routes/` → define os endereços da API.
- `controllers/` → recebe a requisição e valida os dados.
- `services/` → contém a regra do sistema.
- `middlewares/` → autenticação e segurança.
- `database/` → conexão com o Prisma.
- `socket/` → atualizações em tempo real da cozinha/pedidos.
- `utils/` → funções auxiliares.

### Regra simples

Se você quiser alterar **o que a API faz**, normalmente a alteração fica em `services/`.

Se quiser alterar **quem pode acessar**, olhe `routes/` e `middlewares/`.

Se quiser alterar **os dados do banco**, olhe `prisma/schema.prisma`.

Se quiser alterar **uma tela**, não mexa no banco ou no servidor sem necessidade.

## Banco de dados

Arquivo principal:

`back end/prisma/schema.prisma`

Depois de alterar o banco, crie uma migration. Não altere o banco de produção manualmente.

## Para manter suas alterações salvas

Use Git. Depois de uma alteração que está funcionando:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

Assim você consegue voltar para uma versão anterior se alguma alteração der problema.

## Arquivos que NÃO devem ir para o GitHub

- `.env`
- `node_modules/`
- senhas
- tokens
- chaves privadas
- arquivos de banco local

O projeto já possui `.gitignore` para ajudar nisso.
