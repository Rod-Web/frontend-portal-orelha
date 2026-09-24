export function validarNome(nome) {
  // Validar se existe
  if (!nome || !nome.trim()) return "O nome não foi inserido.";

  nome = nome.trim();

  // Validar se tá no tipo correto
  if (typeof nome !== "string")
    return "Só é permitido caracteres de texto no nome.";

  // Validar se o conteúdo está correto
  const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;
  if (!regexNome.test(nome)) return "O nome só pode ter caracteres de A-Z";

  // validar tamanho
  if (nome.length < 3 || nome.length > 100)
    return "O nome deve ter entre 3-100 caracteres";

  return null;
}
