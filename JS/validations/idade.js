export function validarIdade(idade) {
  if (!idade) return "Coloque sua idade.";

  if (!Number.isInteger(idade)) return "Só é permitido números inteiros.";

  if (idade < 0 || idade > 120) return "Idade não permitida para cadastro";

  return null;
}
