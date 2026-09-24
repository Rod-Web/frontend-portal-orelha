export function validarTelefone(telefone) {
  // Verifica se o telefone foi informado
  if (!telefone || !telefone.trim()) return "Telefone é obrigatório";

  telefone = telefone.trim();

  // Verifica se o telefone é um texto
  if (typeof telefone !== "string") return "Telefone deve ser um texto";

  // Só permite números, hífen, espaços e parênteses
  if (!/^[\d\s()-]+$/.test(telefone)) {
    return "Telefone contém caracteres inválidos";
  }

  // Remove tudo que não for número
  telefone = telefone.replace(/\D/g, "");

  // Telefone precisa ter 10 ou 11 dígitos
  if (telefone.length !== 10 && telefone.length !== 11) {
    return "Telefone precisa ter 10 ou 11 dígitos";
  }

  return null;
}
