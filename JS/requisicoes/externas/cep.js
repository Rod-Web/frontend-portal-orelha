/* /JS/requisicoes/externas/cep.js */

export async function consultarCEP(cep) {
  const cepNumeros = cep.replace(/\D/g, "");

  if (cepNumeros.length !== 8) {
    return {erro: "CEP precisa ter exatamente 8 dígitos"};
  }

  try {
    const resposta = await fetch(
      `https://viacep.com.br/ws/${cepNumeros}/json/`,
    );

    if (!resposta.ok) {
      throw new Error("Erro na consulta do CEP.");
    }

    const dados = await resposta.json();

    if (dados.erro) {
      return {erro: "CEP não encontrado."};
    }

    return dados;
  } catch (erro) {
    console.error("Erro ao consultar CEP:", erro);

    return {erro: "Não foi possível consultar o CEP."};

  }
}