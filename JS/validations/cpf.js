export function validarCPF(cpf) {
  cpf = cpf.trim();

  if (!cpf) {
    return "O CPF não foi informado";
  }

  if (!/^[\d.-]+$/.test(cpf)) {
    return "O CPF só pode conter números, ponto e hífen";
  }

  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) {
    return "O CPF precisa ter exatamente 11 dígitos";
  }

  return null;

}