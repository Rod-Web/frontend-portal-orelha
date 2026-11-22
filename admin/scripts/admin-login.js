import { fetchLogin } from "./requisicao/fetchLogin.js";

// ELEMENTOS DO HTML
const formulario = document.getElementById("adminLoginForm");
const usernameInput = document.getElementById("username");
const senhaInput = document.getElementById("senha");
const mensagem = document.getElementById("loginMensagem");

mensagem.textContent = "";

// LOGIN
formulario.addEventListener("submit", async function (event) {

  event.preventDefault();


  const username = usernameInput.value;
  const senha = senhaInput.value;

  // Dados que serão enviados para a API
  const dados = {
    username: username,
    senha: senha,
  };


  const resposta = await fetchLogin(dados);

  if (typeof resposta === "string") return mensagem.textContent = resposta;

  if (resposta.erro) {
    mensagem.classList.add("falha");
    return mensagem.textContent = resposta.erro;
  }

  window.location.href = "./pages/dashboard.html";
});
