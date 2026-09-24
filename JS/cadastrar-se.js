import { dataNascimentoParaIdade } from "./utils/dataNascimentoParaIdade.js";
import { validarNome } from "./validations/nome.js";
import { validarEmail } from "./validations/email.js";
import { validarCPF } from "./validations/cpf.js";
import { validarIdade } from "./validations/idade.js";
import { validarSenha } from "./validations/senha.js";
import { validarTelefone } from "./validations/telefone.js";

// ELEMENTOS DO HTML
const formulario = document.getElementById("formCadastro");
const mensagem = document.getElementById('mensagem');

// ELEMENTOS DO HTML - DADOS
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const cpfInput = document.getElementById("cpf");
const dataNascimentoInput = document.getElementById("data_nascimento");
const telefoneInput = document.getElementById("telefone");
const senhaInput = document.getElementById("senha");

formulario.addEventListener('submit', function(event) {

    event.preventDefault();

    mensagem.textContent = "";

    const dadosUser = {
        nome: nomeInput.value,
        email: emailInput.value,
        cpf: cpfInput.value,
        idade: dataNascimentoParaIdade(dataNascimentoInput.value),
        telefone: telefoneInput.value,
        senha: senhaInput.value
    }

    console.log(dadosUser);

    let erro = validarNome(dadosUser.nome) || validarEmail(dadosUser.email) || validarCPF(dadosUser.cpf) || validarIdade(dadosUser.idade) ||  validarSenha(dadosUser.senha) || validarTelefone(dadosUser.telefone);

    if (erro) return mensagem.textContent = erro;

    // Armazenar os dados do usuário no sessionStorage para utilizar quando for necessário
    sessionStorage.setItem("dadosUser", JSON.stringify(dadosUser));
    window.location.href = "../HTML/cadastrar-se-endereco.html";

    
    
});
