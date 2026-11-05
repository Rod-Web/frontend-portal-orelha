// scripts/requisicao/fetchCadastrarTrabalhoVoluntario.js

import { fetchRefresh } from "./fetchRefresh.js";
import url from "../../../ambiente.js";

const API_URL = `${url}/rotasprivadas/inserirTrabalhoVoluntario`;

export async function fetchCadastrarTrabalhoVoluntario(dados) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
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

    // 401 → renova o token
    const refreshRealizado = await fetchRefresh();
    if (refreshRealizado.erro) return refreshRealizado;

    // Repete a chamada uma única vez
    const retryResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
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
