# Monster Burguer — revisão de segurança

## Situação geral

A aplicação já possui várias proteções importantes: JWT, bcrypt, Zod, Helmet, CORS configurável, rate limit, IDs de acompanhamento não sequenciais e separação entre rotas, controllers e services.

**Mesmo assim, a versão anterior tinha pontos que precisavam de correção antes de produção.** Nesta versão foram corrigidos os pontos prioritários abaixo.

## Corrigido nesta versão

### 1. Socket da cozinha
Antes, qualquer cliente conectado podia tentar entrar na sala `cozinha`.

Agora o servidor exige um token JWT válido e um papel `ADMIN` ou `FUNCIONARIO` antes de colocar o socket na sala administrativa.

Além disso, o front-end não conecta mais o socket administrativo enquanto o visitante está usando a área do cliente.

### 2. Dados de clientes
O endpoint público de cadastro não devolve mais o cadastro completo do cliente.

Também não atualiza mais um cadastro existente apenas porque alguém conhece o telefone.

Ele retorna somente `id` e `nome` para o checkout.

### 3. Permissões
Alterações administrativas sensíveis agora exigem `ADMIN`, incluindo:

- produtos
- categorias
- alterações administrativas de clientes
- caixa
- upload
- exclusão de pedidos
- métricas

Funcionários continuam podendo operar as áreas que usam apenas autenticação, como acompanhamento e atualização de pedidos.

### 4. Monitoramento
`/metrics` agora exige administrador.

`/health` não expõe mais detalhes de banco, memória, quantidade de conexões ou mensagens internas de erro para qualquer visitante.

### 5. Rate limit
Foram adicionados limites específicos para:

- login
- criação do primeiro administrador
- criação de pedidos
- cadastro público de cliente
- upload

### 6. Proxy confiável
`trustProxy` não fica mais ativado automaticamente.

Agora só é ativado quando `TRUST_PROXY=true` no ambiente de produção atrás de um proxy realmente confiável.

---

## Pontos que ainda recomendo para uma segunda etapa

### Token no localStorage
O painel guarda o JWT em `localStorage`.

Isso funciona, mas se houver uma falha XSS no front-end, um script malicioso poderia tentar ler o token.

Para uma versão mais protegida, o próximo passo é migrar para cookie `HttpOnly`, `Secure` e `SameSite`.

### Cadastro por telefone
O checkout público ainda identifica o cliente pelo telefone. Isso é útil para o funcionamento atual, mas **não comprova que a pessoa é dona do telefone**.

Se a loja precisar impedir fraude de endereço/pedido, o ideal é adicionar confirmação por código enviado ao WhatsApp/SMS ou outro mecanismo de verificação.

### Upload de imagens
O upload limita tamanho e tipos MIME, mas uma proteção ainda melhor é validar o conteúdo real do arquivo (magic bytes) e aceitar somente os formatos necessários.

### Dinheiro
O banco usa `Float` para preços e valores de caixa/pedido.

Para um sistema comercial, recomendo migrar os valores financeiros para `Decimal`, evitando problemas de arredondamento de ponto flutuante.

### Auditoria
Para operações financeiras e administrativas importantes, recomendo registrar:

- quem abriu/fechou o caixa;
- quem fez uma movimentação;
- quem alterou o status do pedido;
- quem excluiu ou alterou um produto;
- data e hora da operação.

Isso é especialmente importante quando houver mais de um funcionário usando o sistema.

## Conclusão

A aplicação **não deve ser considerada 100% segura apenas porque essas correções foram feitas**. Segurança é uma etapa contínua.

A estrutura atual, porém, já está organizada para continuar melhorando sem misturar a lógica inteira em um único arquivo.
