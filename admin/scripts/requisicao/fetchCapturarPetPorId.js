import url from '../../../ambiente.js'
const URL = url;
export async function fetchCapturarPetPorId(id) {
  try {
    const response = await fetch(`${URL}/pet/${id}`);

    if (!response.ok) {
      const corpo = await response.json().catch(() => ({}));
      throw new Error(corpo.erro || `HTTP ${response.status}`);
    }

    const dados = await response.json();
    return Array.isArray(dados) ? dados[0] : dados;
  } catch (error) {
    console.log("Erro ao capturar pet:", error.message);
    return {
      erro: error.message || "Erro ao conectar com o servidor.",
    };
  }
}
