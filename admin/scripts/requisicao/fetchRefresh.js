import url from '../../../ambiente.js'
const URL = url;
export async function fetchRefresh() {
  try {
    const response = await fetch(`${URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (response.status === 204) return true;

    return await response.json();
  } catch (error) {
    console.log("Erro: " + error.message);
    return { erro: "Erro ao conectar com o servidor." };
  }
}
