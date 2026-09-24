import { fetchLogin } from './requisicoes/fetchLogin.js';

import { validarCPF } from './validations/cpf.js'
import { validarSenha } from "./validations/senha.js";

// ELEMENTOS DO HTML
const formulario = document.getElementById('form-login');
const cpfInput = document.getElementById('cpf');
const senhaInput = document.getElementById('senha');
const mensagem = document.getElementById('mensagem');



// LOGIN
formulario.addEventListener('submit', async function(event) {

    event.preventDefault();

    mensagem.textContent = "";

    const cpf = cpfInput.value;
    const senha = senhaInput.value

    let erro = validarCPF(cpf) || validarSenha(senha);
    if (erro) return mensagem.textContent = erro;


    // Dados que serão enviados para a API
    const dados = {
        cpf: cpf,
        senha: senha
    };

    console.log(dados);
    const resposta = await fetchLogin(dados);

    if(typeof resposta === "string") return mensagem.textContent = resposta;

    if(resposta.erro) return (mensagem.textContent = resposta.erro);

    const tipo_usuario = resposta.tipo_usuario;

    if(tipo_usuario === "cliente") return window.location.href = '../index.html';

    window.location.href = `../HTML/dashboards/dashboard-${tipo_usuario}.html`;
});