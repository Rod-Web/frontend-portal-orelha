/* /JS/cadastrar-se-endereco.js */

import { consultarCEP } from "./requisicoes/externas/cep.js";
import {
  travarCamposEndereco,
  preencherEndereco,
  limparEndereco,
  mostrarBuscando,
  restaurarPlaceholders,
} from "./utils/configEndereco.js";

import { validarCEP } from "./validations/cep.js";
import { validarNumero } from "./validations/numeroResidencial.js";

import { fetchInserirCliente } from "./requisicoes/fetchInserirCliente.js";

const cepInput = document.getElementById("cep");
const numeroInput = document.getElementById("numero");
const mensagem = document.getElementById("mensagem");

travarCamposEndereco();

cepInput.addEventListener("change", async () => {

    mensagem.textContent = ""
  mostrarBuscando();

  const endereco = await consultarCEP(cepInput.value);

  if (endereco.erro) {
    limparEndereco();
    mensagem.textContent = endereco.erro;
    return;
  }

  preencherEndereco(endereco);

  restaurarPlaceholders();
});

const formularioEndereco = document.querySelector(".address-form");

formularioEndereco.addEventListener("submit", async (event) => {
    event.preventDefault();

    mensagem.textContent = "";

    const dadosEndereco = {
        cep: cepInput.value,
        numero: numeroInput.value,
    };

    const erro = validarCEP(dadosEndereco.cep) || validarNumero(dadosEndereco.numero);

    if (erro) {
        mensagem.textContent = erro;
        return;
    }

    sessionStorage.setItem("dadosEndereco", JSON.stringify(dadosEndereco));

    const inserirCliente = await fetchInserirCliente();
    if(inserirCliente.erro) {
      return alert(inserirCliente.erro)
    };

    alert("Usuário: " + inserirCliente.nomeCliente + " cadastrado com sucesso!");
    window.location.replace("./login.html");
}); 