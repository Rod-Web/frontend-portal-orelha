// scripts/requisicao/fetchExcluirTrabalhoVoluntario.js

import { fetchRefresh } from "./fetchRefresh.js";
import url from "../../../ambiente.js";

const API_URL = `${url}/rotasprivadas/trabalho-voluntario`;

export async function fetchExcluirTrabalhoVoluntario(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.status !== 401) {
      if (!response.ok) {
        const corpo = await response.json().catch(() => ({}));
        throw new Error(corpo.erro || `HTTP ${response.status}`);
      }
      if (response.status === 204) return { ok: true };
      return await response.json().catch(() => ({ ok: true }));
    }

    // 401 → renova
    const refreshRealizado = await fetchRefresh();
    if (refreshRealizado.erro) return refreshRealizado;

    const retryResponse = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!retryResponse.ok) {
      const corpo = await retryResponse.json().catch(() => ({}));
      throw new Error(corpo.erro || `HTTP ${retryResponse.status}`);
    }

    if (retryResponse.status === 204) return { ok: true };
    return await retryResponse.json().catch(() => ({ ok: true }));
  } catch (error) {
    console.log("Erro: " + error.message);
    return { erro: error.message || "Erro ao conectar com o servidor." };
  }
}
