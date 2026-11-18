// ./admin/scripts/requisicao/fetchEditarStatusSolicitacao.js
import url from "../../../ambiente.js";

/**
 * Atualiza o status de uma solicitação de adoção.
 * @param {number} id
 * @param {"PENDENTE"|"EM_ANALISE"|"APROVADA"|"REPROVADA"} status
 * @returns {Promise<{ mensagem?: string, erro?: string }>}
 */
export async function fetchEditarStatusSolicitacao(id, status) {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/editarStatusSolicitacao/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      },
    );

    const data = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      return {
        erro: data.erro || data.mensagem || `Erro ${resposta.status}`,
      };
    }

    return data;
  } catch (erro) {
    console.error("Erro ao atualizar status da solicitação:", erro);
    return { erro: "Não foi possível atualizar o status." };
  }
}
