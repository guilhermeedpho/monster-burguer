const CAMPOS_SENSIVEIS = new Set([
  "senha",
  "senhaHash",
  "token",
  "cpf",
  "telefone",
  "whatsapp",
  "email",
  "cep",
  "rua",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "estado",
  "referencia",
]);

/**
 * Retorna uma cópia do objeto com os valores de campos sensíveis
 * (dado pessoal, senha, token) trocados por "[oculto]" — usado antes
 * de mandar qualquer coisa pro log. Mantém a estrutura (útil pra
 * depurar o formato do payload) sem gravar o conteúdo de verdade.
 */
export function redigir(valor) {
  if (Array.isArray(valor)) {
    return valor.map(redigir);
  }

  if (valor && typeof valor === "object") {
    const copia = {};

    for (const chave of Object.keys(valor)) {
      copia[chave] = CAMPOS_SENSIVEIS.has(chave)
        ? "[oculto]"
        : redigir(valor[chave]);
    }

    return copia;
  }

  return valor;
}
