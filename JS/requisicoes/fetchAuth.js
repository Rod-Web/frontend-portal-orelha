import { fetchRefresh } from "./fetchRefresh.js";

const URL = "https://backend-portal-orelha.onrender.com";

export async function fetchAuth() {
  try {
    let response = await fetch(`${URL}/rotasprivadas/me`, {
      credentials: "include",
    });

    // Access token ausente, inválido ou expirado
    if (response.status === 401) {
      const refreshRealizado = await fetchRefresh();

      // Refresh token inválido/expirado
      if (refreshRealizado.erro) return refreshRealizado;
    }

    // Tenta novamente depois de renovar o access token
    response = await fetch(`${URL}/rotasprivadas/me`, {
      credentials: "include",
    });

    return await response.json();
  } catch (error) {
    console.log(error.message);

    return {
      erro: "Erro ao conectar com o servidor.",
    };
  }
}
