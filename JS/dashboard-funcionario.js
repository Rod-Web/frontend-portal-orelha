import { fetchAuth } from "./requisicoes/fetchAuth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const identificarSe = await fetchAuth();
  if (identificarSe.erro) {
    alert(identificarSe.erro); // Criar janela personalizada
    return window.location.replace("/HTML/login.html");
  }

  if (identificarSe.tipo_usuario !== "funcionario") {
    alert("Usuário não tem permissão para acessar essa página."); // Criar janela personalizada
    return window.location.replace("/HTML/login.html");
  };

});
