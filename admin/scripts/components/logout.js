import { mostrarAviso } from "./modal.js";
import { fetchLogout } from "../requisicao/fetchLogout.js";

const botoesSair = document.querySelectorAll(".sair");

botoesSair.forEach((sair) => {
  let processando = false;

  sair.addEventListener("click", async () => {
    if (processando) return;
    processando = true;
    sair.disabled = true;

    try {
      const response = await fetchLogout();
      if (response.erro) {
        mostrarAviso(response.erro, null, "Erro");
      } else {
        mostrarAviso(
          "Logout realizado com sucesso!",
          "./login.html",
          "Sucesso",
        );
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      mostrarAviso("Erro ao fazer logout. Tente novamente.", null, "Erro");
    } finally {
      processando = false;
      sair.disabled = false;
    }
  });
});