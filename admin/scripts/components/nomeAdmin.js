import { fetchAuth } from "../requisicao/fetchAuth.js";
import { mostrarAviso } from "../components/modal.js";

document.addEventListener("DOMContentLoaded", async () => {
  const identificarSe = await fetchAuth();
  if (identificarSe.erro) {
    return mostrarAviso(identificarSe.erro, "./login.html", "Não Autorizado");
  }

  const nome = document.querySelector(".topbar-usuario span");
  console.log(identificarSe);
  nome.textContent = identificarSe.nomeUsuario;
});

const topbarUsuario = document.querySelector(".topbar-usuario");

topbarUsuario.addEventListener("click", () => {
  const sair = document.querySelector(".sair");
  sair.classList.toggle("aberto");
});

