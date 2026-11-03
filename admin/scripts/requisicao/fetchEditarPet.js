// scripts/requisicao/fetchEditarPet.js

import { fetchRefresh } from "./fetchRefresh.js";

import url from '../../../ambiente.js'
const URL = url;
export async function fetchEditarPet(id, formData) {
  try {
    const response = await fetch(`${URL}/rotasprivadas/pet/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (response.status !== 401) {
      if (!response.ok) {
        const corpo = await response.json().catch(() => ({}));
        throw new Error(
          corpo.erro || corpo.message || `HTTP ${response.status}`,
        );
      }

      if (response.status === 204) return { ok: true };

      return await response.json();
    }

    const refreshRealizado = await fetchRefresh();
    if (refreshRealizado.erro) return refreshRealizado;

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
