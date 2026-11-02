import { fetchRefresh } from "./fetchRefresh.js";

const URL = "http://localhost:3000";

export async function fetchAtualizarPet(id, formData) {
  try {
    const executarPut = () =>
      fetch(`${URL}/rotasprivadas/pet/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

    let response = await executarPut();

    if (response.status === 401) {
      const refresh = await fetchRefresh();
      if (refresh?.erro) return refresh;

      response = await executarPut();

      if (response.status === 401) {
        return { erro: "Sessão expirada. Faça login novamente." };
      }
    }

    if (!response.ok) {
      const corpo = await response.json().catch(() => ({}));
      throw new Error(corpo.erro || `HTTP ${response.status}`);
    }

    return await response.json().catch(() => ({}));
  } catch (error) {
    console.log("Erro ao atualizar pet:", error.message);
    return {
      erro: error.message || "Erro ao conectar com o servidor.",
    };
  }
}
