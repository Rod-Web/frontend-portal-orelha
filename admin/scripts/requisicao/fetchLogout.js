const URL = "http://localhost:3000";

export async function fetchLogout() {
  try {
    const response = await fetch(`${URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return { erro: "Erro ao fazer logout. Tente novamente." };
    }

    return true; // Logout bem-sucedido

} catch (error) {
    console.error("Erro: " + error.message);
    return { erro: "Erro ao conectar com o servidor." };
  }
}
