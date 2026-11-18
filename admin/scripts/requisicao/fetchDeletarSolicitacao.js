// ./admin/scripts/requisicao/fetchDeletarSolicitacao.js
import url from "../../../ambiente.js";

/**
 * Deleta uma solicitação de adoção.
 * @param {number} id
 * @returns {Promise<{ mensagem?: string, erro?: string }>}
 */
export async function fetchDeletarSolicitacao(id) {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/deletarSolicitacaoAdocao/${id}`,
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
    console.error("Erro ao excluir solicitação:", erro);
    return { erro: "Não foi possível excluir a solicitação." };
  }
}
