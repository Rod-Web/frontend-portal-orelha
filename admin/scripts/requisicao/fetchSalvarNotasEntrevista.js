// ./admin/scripts/requisicao/fetchSalvarNotasEntrevista.js
import url from "../../../ambiente.js";

/**
 * Insere ou atualiza as anotações da entrevista.
 * @param {number} id
 * @param {string} anotacoes
 * @returns {Promise<{ mensagem?: string, erro?: string }>}
 */
export async function fetchSalvarNotasEntrevista(id, anotacoes) {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/inserirAnotacoesEntrevista/${id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ anotacoes }),
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
    console.error("Erro ao salvar anotações:", erro);
    return { erro: "Não foi possível salvar as anotações." };
  }
}
