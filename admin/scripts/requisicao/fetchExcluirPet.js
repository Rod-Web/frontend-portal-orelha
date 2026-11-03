import { fetchRefresh } from "./fetchRefresh.js";

import url from '../../../ambiente.js'
const URL = url;
export async function fetchExcluirPet(id) {
  try {
    const executarDelete = () =>
      fetch(`${URL}/rotasprivadas/pet/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

    let response = await executarDelete();

    if (response.status === 401) {
      const refresh = await fetchRefresh();
      if (refresh?.erro) return refresh;

      response = await executarDelete();

      if (response.status === 401) {
        return { erro: "Sessão expirada. Faça login novamente." };
      }
    }

    if (!response.ok && response.status !== 204) {
      const corpo = await response.json().catch(() => ({}));
      throw new Error(corpo.erro || `HTTP ${response.status}`);
    }

    return { sucesso: true };
  } catch (error) {
    console.log("Erro ao excluir pet:", error.message);
    return {
      erro: error.message || "Erro ao conectar com o servidor.",
    };
  }
}
