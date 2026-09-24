export function validarCEP(cep) {
  // Verifica se foi informado
  if (!cep || !cep.trim()) {
    return "CEP é obrigatório";
  }

  cep = cep.trim();

  // Verifica se é texto
  if (typeof cep !== "string") {
    return "CEP deve ser um texto";
  }

  // Verifica se possui apenas números e hífen
  if (!/^[\d-]+$/.test(cep)) {
    return "CEP só pode conter números e hifen";
  }

  // CEP precisa ter exatamente 8 dígitos depois de remover o hifen
  if (cep.replace(/\D/g, "").length !== 8) {
    return "CEP precisa ter exatamente 8 dígitos";
  }

  return null;
}
