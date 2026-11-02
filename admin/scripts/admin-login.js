import { fetchLogin } from "./requisicao/fetchLogin.js";

// ELEMENTOS DO HTML
const formulario = document.getElementById("adminLoginForm");
const cpfInput = document.getElementById("cpf");
const senhaInput = document.getElementById("senha");
const mensagem = document.getElementById("loginMensagem");

mensagem.textContent = "";

// LOGIN
formulario.addEventListener("submit", async function (event) {

  event.preventDefault();


  const cpf = cpfInput.value;
  const senha = senhaInput.value;

  // Dados que serão enviados para a API
  const dados = {
    cpf: cpf,
    senha: senha,
  };


  const resposta = await fetchLogin(dados);

  if (typeof resposta === "string") return mensagem.textContent = resposta;

  if (resposta.erro) {
    mensagem.classList.add("falha");
    return mensagem.textContent = resposta.erro;
  }

  window.location.href = "dashboard.html";
});
