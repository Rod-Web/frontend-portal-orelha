const URL = "https://backend-portal-orelha.onrender.com";

export async function fetchRefresh() {
    try {
        const response = await fetch(`${URL}/auth/refresh`, {
        method: "POST",
        credentials: "include"
        });

        if(response.status === 204) return true

        return await response.json();

    } catch (error) {
        console.log(error.message);
        return {erro: "Erro ao conectar com o servidor."};
    }
}
