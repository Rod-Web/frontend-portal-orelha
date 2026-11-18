// ./admin/scripts/requisicao/fetchEditarStatusPet.js
import url from "../../../ambiente.js";

/**
 * Atualiza o status de um pet.
 * @param {number} id - numero_identificacao do pet
 * @param {"DISPONIVEL"|"EM_PROCESSO"|"ADOTADO"} status
 * @returns {Promise<{ mensagem?: string, erro?: string }>}
 */
export async function fetchEditarStatusPet(id, status) {
  try {
    const resposta = await fetch(`${url}/rotasprivadas/editarStatusPet/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const data = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      return {
        erro: data.erro || data.mensagem || `Erro ${resposta.status}`,
      };
    }

    return data;
  } catch (erro) {
    console.error("Erro ao atualizar status do pet:", erro);
    return { erro: "Não foi possível atualizar o status do pet." };
  }
}
