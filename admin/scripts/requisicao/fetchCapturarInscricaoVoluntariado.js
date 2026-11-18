// ./admin/scripts/requisicao/fetchCapturarInscricaoVoluntariado.js
import url from "../../../ambiente.js";

/**
 * Busca uma única inscrição de voluntariado.
 * @param {number} id
 * @returns {Promise<object|{erro: string}>}
 */
export async function fetchCapturarInscricaoVoluntariado(id) {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/inscricao-voluntariado/${id}`,
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
    console.error("Erro ao carregar inscrição:", erro);
    return { erro: "Não foi possível carregar a inscrição." };
  }
}
