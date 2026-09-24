export function validarEmail(email) {
  if (!email || !email.trim()) return "Preencha o campo do email.";

  email = email.trim();

  if (typeof email !== "string") return "O email deve ser uma string.";

  if (email.length < 10 || email.length > 200) {
    return "Email deve ter entre 10 e 200 caracteres";
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) return "Email com formato inválido.";

  return null;
}
