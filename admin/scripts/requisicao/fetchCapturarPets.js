const URL = "http://localhost:3000";

export async function fetchCapturarPets() {
  try {
    const response = await fetch(`${URL}/pet`);

    if (!response.ok) {
      const corpo = await response.json().catch(() => ({}));
      throw new Error(corpo.erro || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.log("Erro: " + error.message);
    return {
      erro:
        error.message ||
        "Erro ao conectar com o servidor. Contate o suporte técnico.",
    };
  }
}