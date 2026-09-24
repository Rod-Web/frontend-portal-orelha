function validarCPF(cpf) {

    cpf = cpf.trim();

    // Verifica se foi informado
    if (!cpf) {
        return "O CPF não foi informado";
    }

    // Verifica se é uma string
    if (typeof cpf !== "string") {
        return "O CPF precisa ser uma string";
    }

    // Permite apenas números, ponto e hífen
    if (!/^[\d.-]+$/.test(cpf)) {
        return "O CPF contém caracteres inválidos";
    }

    // Remove pontos e hífen
    cpf = cpf.replace(/\D/g, "");

    // CPF precisa ter 11 números
    if (cpf.length !== 11) {
        return "O CPF precisa ter exatamente 11 dígitos";
    }

    // Rejeita CPFs com todos os números iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        return "CPF inválido";
    }

    // Calcula primeiro dígito
    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    if (digito1 !== Number(cpf[9])) {
        return "CPF inválido";
    }

    // Calcula segundo dígito
    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    if (digito2 !== Number(cpf[10])) {
        return "CPF inválido";
    }

    return null;
}

//validar senha

function validarSenha(senha) {

    senha = senha.trim();

    // Verifica se foi informada
    if (!senha) {
        return "A senha é obrigatória";
    }

    // Verifica se é texto
    if (typeof senha !== "string") {
        return "A senha deve ser um texto";
    }

    // Verifica tamanho
    if (senha.length < 8 || senha.length > 30) {
        return "A senha deve ter entre 8 e 30 caracteres";
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(senha)) {
        return "A senha deve conter pelo menos uma letra maiúscula";
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(senha)) {
        return "A senha deve conter pelo menos uma letra minúscula";
    }

    // Pelo menos um número
    if (!/[0-9]/.test(senha)) {
        return "A senha deve conter pelo menos um número";
    }

    // Pelo menos um caractere especial
    if (!/[^A-Za-z0-9]/.test(senha)) {
        return "A senha deve conter pelo menos um caractere especial";
    }

    return null;
}

const formulario = document.querySelector("#formCadastro");

const cpf = document.querySelector("#cpf");
const senha = document.querySelector("#senha");

const mensagem = document.querySelector("#mensagem");

formulario.addEventListener("submit", function (event) {

    // Impede a página de recarregar
    event.preventDefault();

    mensagem.textContent = "";

    // Valida CPF
    let erro = validarCPF(cpf.value);

    if (erro) {
        mensagem.textContent = erro;
        return;
    }

    // Valida senha
    erro = validarSenha(senha.value);

    if (erro) {
        mensagem.textContent = erro;
        return;
    }

    // Se chegou aqui, as validações passaram
    mensagem.textContent = "Dados válidos!";

});