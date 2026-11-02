// scripts/requisicao/fetchEditarPet.js

import { fetchRefresh } from "./fetchRefresh.js";

const URL = "http://localhost:3000";

export async function fetchEditarPet(id, formData) {
  try {
    const response = await fetch(`${URL}/rotasprivadas/pet/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    // Se não for 401, retorna o resultado direto (sem duplicar)
    if (response.status !== 401) {
      if (!response.ok) {
        const corpo = await response.json().catch(() => ({}));
        throw new Error(
          corpo.erro || corpo.message || `HTTP ${response.status}`,
        );
      }

      // Alguns backends respondem 204 No Content no PUT
      if (response.status === 204) return { ok: true };

      return await response.json();
    }

    // 401 → tenta renovar o token
    const refreshRealizado = await fetchRefresh();
    if (refreshRealizado.erro) return refreshRealizado;

    // Repete a chamada UMA única vez após renovar
    const retryResponse = await fetch(`${URL}/rotasprivadas/pet/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (!retryResponse.ok) {
      const corpo = await retryResponse.json().catch(() => ({}));
      throw new Error(
        corpo.erro || corpo.message || `HTTP ${retryResponse.status}`,
      );
    }

    if (retryResponse.status === 204) return { ok: true };

    return await retryResponse.json();
  } catch (error) {
    console.log("Erro: " + error.message);
    return { erro: error.message || "Erro ao conectar com o servidor." };
  }
}
