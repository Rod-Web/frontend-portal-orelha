// ./admin/scripts/requisicao/fetchCapturarSolicitacaoAdocao.js
import url from "../../../ambiente.js";

/**
 * Busca uma única solicitação de adoção.
 * @param {number} id
 * @returns {Promise<object|{erro: string}>}
 */
export async function fetchCapturarSolicitacaoAdocao(id) {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/solicitacao-adocao/${id}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao carregar solicitação:", erro);
    return { erro: "Não foi possível carregar a solicitação." };
  }
}
