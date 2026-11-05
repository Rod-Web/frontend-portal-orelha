// scripts/requisicao/fetchCapturarTrabalhosVoluntarios.js

import url from "../../../ambiente.js";

const API_URL = `${url}/trabalhos-voluntario`;

export async function fetchCapturarTrabalhosVoluntarios() {
  try {
    const response = await fetch(API_URL, { credentials: "include" });

    if (!response.ok) {
      const corpo = await response.json().catch(() => ({}));
      throw new Error(corpo.erro || `HTTP ${response.status}`);
    }

    console.log(response.status)

    return await response.json();
  } catch (error) {
    console.log("Erro: " + error.message);
    return { erro: error.message || "Erro ao conectar com o servidor." };
  }
}
