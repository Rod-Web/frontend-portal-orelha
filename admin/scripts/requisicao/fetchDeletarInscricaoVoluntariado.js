// ./admin/scripts/requisicao/fetchDeletarInscricaoVoluntariado.js
import url from "../../../ambiente.js";

/**
 * Deleta uma inscrição de voluntariado.
 * @param {number} id
 * @returns {Promise<{ mensagem?: string, erro?: string }>}
 */
export async function fetchDeletarInscricaoVoluntariado(id) {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/deletarInscricaoVoluntariado/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    const data = await resposta.json().catch(() => ({}));
    return data;
  } catch (erro) {
    console.error("Erro ao excluir inscrição:", erro);
    return { erro: "Não foi possível excluir a inscrição." };
  }
}
