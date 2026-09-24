const URL = "https://backend-portal-orelha.onrender.com";

export async function fetchInserirCliente() {
  const dadosUser = JSON.parse(sessionStorage.getItem("dadosUser"));
  const dadosEndereco = JSON.parse(sessionStorage.getItem("dadosEndereco"));

  const dadosCliente = {
    ...dadosUser,
    endereco: {
      ...dadosEndereco,
    },
  };

  console.log(dadosCliente)

  const response = await fetch(`${URL}/cliente/inserirCliente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosCliente),
  });

  return await response.json();
}
