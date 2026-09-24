export function validarSenha(senha) {
  senha = senha.trim();

  if (!senha) {
    return "A senha é obrigatória";
  }

  if (senha.length < 8 || senha.length > 30) {
    return "A senha deve ter entre 8 e 30 caracteres";
  }

  if (!/[A-Z]/.test(senha)) {
    return "A senha deve ter pelo menos uma letra maiúscula";
  }

  if (!/[a-z]/.test(senha)) {
    return "A senha deve ter pelo menos uma letra minúscula";
  }

  if (!/[0-9]/.test(senha)) {
    return "A senha deve ter pelo menos um número";
  }

  if (!/[^A-Za-z0-9]/.test(senha)) {
    return "A senha deve ter pelo menos um caractere especial";
  }

  return null;
}
