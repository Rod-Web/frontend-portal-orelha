import { fetchCadastrarPet } from "./requisicao/fetchCadastrarPet.js";
import { mostrarAviso } from "./components/modal.js";

const inputImg = document.getElementById("img");
const previewImg = document.getElementById("previewImg");
const uploadConteudo = document.getElementById("uploadConteudo");

inputImg.addEventListener("change", () => {
  const arquivo = inputImg.files?.[0];
  if (!arquivo) return;

  previewImg.src = URL.createObjectURL(arquivo);
  previewImg.hidden = false;
  uploadConteudo.style.display = "none";
});

// ELEMENTOS DO HTML
const formulario = document.getElementById("formPet");
const imagemInput = document.getElementById("img");
const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const grandezaIdadeInput = document.getElementById("grandeza_idade");
const especieInput = document.getElementById("especie");
const pesoInput = document.getElementById("peso");
const sexoInput = document.getElementById("sexo");
const racaInput = document.getElementById("raca");
const descricaoInput = document.getElementById("descricao");

const btn_cadastrar = document.getElementById("botaoSalvar");

formulario.addEventListener("submit", async function (event) {
  event.preventDefault();
  btn_cadastrar.disabled = true; // Desabilita o botão para evitar múltiplos envios

    const formData = new FormData();


    formData.append("imagem", imagemInput.files[0]);
    formData.append("nome", nomeInput.value);
    formData.append("unidade_idade", idadeInput.value);
    formData.append("grandeza_idade", grandezaIdadeInput.value);
    formData.append("especie", especieInput.value);
    formData.append("peso", pesoInput.value);
    formData.append("sexo", sexoInput.value);
    formData.append("raca", racaInput.value);
    formData.append("descricao", descricaoInput.value);

    const resultado = await fetchCadastrarPet(formData);

    console.log("Resultado do cadastro:", resultado);

    if (resultado.erro) {
        btn_cadastrar.disabled = false; // Reabilita o botão após a conclusão do envio
        mostrarAviso(resultado.erro, null, "Erro");
    } else {
        btn_cadastrar.disabled = false; // Reabilita o botão após a conclusão do envio
        mostrarAviso("Pet cadastrado com sucesso!", "./dashboard.html", "Sucesso");
    }
});