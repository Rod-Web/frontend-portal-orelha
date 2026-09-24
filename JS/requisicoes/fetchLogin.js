const URL = "https://backend-portal-orelha.onrender.com";

export async function fetchLogin(dados) {
    try {
        const response = await fetch(`${URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(dados),
        });

        return await response.json();

    } catch (error) {
        const erro = "Erro ao conectar com o servidor.";
        console.log(error.message);
        return {erro};
    };
};