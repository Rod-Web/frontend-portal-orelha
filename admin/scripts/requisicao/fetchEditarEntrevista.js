// ./admin/scripts/requisicao/fetchEditarEntrevista.js
import url from "../../../ambiente.js";

/**
 * Atualiza o status "entrevista" de uma solicitação.
 * @param {number} id
 * @param {boolean} entrevista
 * @returns {Promise<{ mensagem?: string, erro?: string }>}
 */
export async function fetchEditarEntrevista(id, entrevista) {
    try {
        const resposta = await fetch(
            `${url}/rotasprivadas/editarEntrevista/${id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ entrevista }),
            }
        );

        const data = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            return {
                erro: data.erro || data.mensagem || `Erro ${resposta.status}`,
            };
        }

        return data;
    } catch (erro) {
        console.error("Erro ao atualizar entrevista:", erro);
        return { erro: "Não foi possível atualizar o status da entrevista." };
    }
}