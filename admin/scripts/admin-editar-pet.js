// scripts/admin-editar-pets.js

import { mostrarAviso } from "./components/modal.js";
import { fetchEditarPet } from "./requisicao/fetchEditarPet.js";

import url from '../../ambiente.js';

const API_URL = url;

const DIAS_POR_SEMANA = 7;
const DIAS_POR_MES = 30.44;
const DIAS_POR_ANO = 365;

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
  <rect width='600' height='600' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='72' fill='#63291e'>🐾</text>
</svg>
`);

/* ===== ELEMENTOS ===== */
const form = document.getElementById("formPet");
const petIdBadge = document.getElementById("petIdBadge");
const petInfo = document.getElementById("petInfo");
const previewImg = document.getElementById("previewImg");
const inputImg = document.getElementById("img");
const btnManter = document.getElementById("btnManterImagem");
const botaoSalvar = document.getElementById("botaoSalvar");
const mensagemForm = document.getElementById("mensagemForm");

const campoNome = document.getElementById("nome");
const campoIdade = document.getElementById("idade");
const campoGrandeza = document.getElementById("grandeza_idade");
const campoEspecie = document.getElementById("especie");
const campoPeso = document.getElementById("peso");
const campoSexo = document.getElementById("sexo");
const campoRaca = document.getElementById("raca");
const campoStatus = document.getElementById("status");
const campoDescricao = document.getElementById("descricao");

/* ===== ESTADO ===== */
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

let imagemOriginal = ""; // URL pura vinda da API
let imagemAlterada = false; // true se o usuário escolheu arquivo novo
let salvando = false;

/* ===== UTILIDADES ===== */
function decomporIdade(dias) {
  const d = Number(dias);
  if (!Number.isFinite(d) || d < 0) return { quantidade: 0, unidade: "dias" };
  if (d < DIAS_POR_SEMANA) return { quantidade: d, unidade: "dias" };
  if (d < DIAS_POR_MES)
    return { quantidade: Math.floor(d / DIAS_POR_SEMANA), unidade: "semanas" };
  if (d < DIAS_POR_ANO)
    return { quantidade: Math.round(d / DIAS_POR_MES), unidade: "meses" };
  return { quantidade: Math.floor(d / DIAS_POR_ANO), unidade: "anos" };
}

function formatarData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function mostrarMensagem(texto, tipo = "info") {
  if (!mensagemForm) return;
  mensagemForm.textContent = texto;
  if (texto) mensagemForm.dataset.tipo = tipo;
  else delete mensagemForm.dataset.tipo;
}

/* Selects aceitam valores da API mesmo fora do HTML */
function selecionarOuAdicionar(select, valor, rotulo) {
  if (!valor) return;
  const opt = Array.from(select.options).find((o) => o.value === valor);
  if (opt) {
    select.value = valor;
    return;
  }
  const novo = document.createElement("option");
  novo.value = valor;
  novo.textContent = rotulo || valor;
  select.appendChild(novo);
  select.value = valor;
}

/* ===== CARREGAR PET ===== */
async function buscarPet(petId) {
  const urls = [
    `${API_URL}/pet/${petId}`,
    `${API_URL}/pet/buscar?campo=numero_identificacao&valor=${petId}`,
  ];

  for (const url of urls) {
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) continue;

      const dados = await resposta.json();
      const pet = Array.isArray(dados) ? dados[0] : dados;

      if (pet && Number(pet.numero_identificacao) === petId) return pet;
    } catch {
      continue;
    }
  }
  return null;
}

async function carregarPet() {
  if (!id || Number.isNaN(id)) {
    mostrarAviso("ID do pet não informado na URL.", "./pets.html", "Erro");
    return;
  }

  try {
    const pet = await buscarPet(id);

    if (!pet) {
      mostrarAviso("Pet não encontrado.", "./pets.html", "Erro");
      return;
    }

    preencherFormulario(pet);
  } catch (erro) {
    console.error("Erro ao carregar pet:", erro);
    mostrarAviso(
      "Não foi possível carregar os dados do pet.",
      "./pets.html",
      "Erro",
    );
  }
}

function preencherFormulario(pet) {
  petIdBadge.textContent = `#${pet.numero_identificacao}`;
  petInfo.textContent = `Cadastrado em ${formatarData(pet.data_cadastro)}`;

  imagemOriginal = pet.imagem || "";
  imagemAlterada = false;

  previewImg.src = imagemOriginal || PLACEHOLDER;
  previewImg.alt = `Foto de ${pet.nome || "pet"}`;
  previewImg.onerror = () => {
    previewImg.onerror = null;
    previewImg.src = PLACEHOLDER;
  };

  campoNome.value = pet.nome || "";
  campoRaca.value = pet.raca || "";
  campoPeso.value = pet.peso ? parseFloat(pet.peso) : "";
  campoDescricao.value = pet.descricao || "";

  selecionarOuAdicionar(
    campoEspecie,
    (pet.especie || "").toLowerCase(),
    "Outro",
  );
  selecionarOuAdicionar(campoSexo, (pet.sexo || "").toLowerCase(), "Outro");
  selecionarOuAdicionar(campoStatus, pet.status, "Outro");

  const idade = decomporIdade(pet.idade_aproximada_em_dias);
  campoIdade.value = idade.quantidade;
  campoGrandeza.value = idade.unidade;

  form.setAttribute("aria-busy", "false");
}

/* ===== IMAGEM ===== */
function resetarImagem() {
  if (previewImg.dataset.blobUrl) {
    URL.revokeObjectURL(previewImg.dataset.blobUrl);
    delete previewImg.dataset.blobUrl;
  }
  previewImg.src = imagemOriginal || PLACEHOLDER;
  inputImg.value = "";
  imagemAlterada = false;
  btnManter.hidden = true;
}

inputImg.addEventListener("change", () => {
  const arquivo = inputImg.files[0];

  if (!arquivo) {
    resetarImagem();
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    mostrarMensagem("Selecione um arquivo de imagem.", "erro");
    resetarImagem();
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarMensagem("A imagem é muito grande (máx. 5 MB).", "erro");
    resetarImagem();
    return;
  }

  if (previewImg.dataset.blobUrl) {
    URL.revokeObjectURL(previewImg.dataset.blobUrl);
  }

  const url = URL.createObjectURL(arquivo);
  previewImg.src = url;
  previewImg.onerror = null;
  previewImg.dataset.blobUrl = url;
  imagemAlterada = true;
  btnManter.hidden = false;
  mostrarMensagem("");
});

btnManter.addEventListener("click", resetarImagem);

/* ===== SUBMIT ===== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (salvando) return;

  /* Validações */
  if (!campoNome.value.trim()) {
    mostrarMensagem("O nome é obrigatório.", "erro");
    campoNome.focus();
    return;
  }

  const peso = parseFloat(campoPeso.value);
  if (!Number.isFinite(peso) || peso <= 0) {
    mostrarMensagem("O peso deve ser maior que zero.", "erro");
    campoPeso.focus();
    return;
  }

  const quantidade = parseInt(campoIdade.value, 10);
  if (!Number.isFinite(quantidade) || quantidade < 0) {
    mostrarMensagem("A idade deve ser ≥ 0.", "erro");
    campoIdade.focus();
    return;
  }

  /* Regra da imagem: precisa ter pelo menos uma das duas */
  const arquivo = inputImg.files[0];

  if (!arquivo && !imagemOriginal) {
    mostrarMensagem("O pet precisa ter uma imagem.", "erro");
    return;
  }

  /* Bloqueio de duplo envio */
  salvando = true;
  botaoSalvar.disabled = true;
  const htmlOriginalBotao = botaoSalvar.innerHTML;
  botaoSalvar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Salvando…';
  mostrarMensagem("");

  try {
    const formData = new FormData();

    formData.append("nome", campoNome.value.trim());
    formData.append("especie", campoEspecie.value);
    formData.append("raca", campoRaca.value.trim());
    formData.append("sexo", campoSexo.value);
    formData.append("peso", String(peso));
    formData.append("status", campoStatus.value);
    formData.append("descricao", campoDescricao.value.trim());
    formData.append("unidade_idade", String(quantidade));
    formData.append("grandeza_idade", campoGrandeza.value);

    /* Regra da imagem:
       - Alterou → "imagem" (arquivo)
       - Não alterou → "imagemUrl" (string)
       Nunca ambos. Nunca vazio. */
    if (imagemAlterada && arquivo) {
      formData.append("imagem", arquivo);
    } else {
      formData.append("imagemUrl", imagemOriginal);
    }

    const response = await fetchEditarPet(id, formData);

    if (response.erro) {
      mostrarMensagem(response.erro, "erro");
      mostrarAviso(response.erro, null, "Erro");
      return;
    }

    const nomeAtualizado = response.nomePet || "Pet";
    mostrarAviso(
      `${nomeAtualizado} foi atualizado com sucesso!`,
      "./pets.html",
      "Sucesso",
    );
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    const msg = "Não foi possível salvar as alterações.";
    mostrarMensagem(msg, "erro");
    mostrarAviso(msg, null, "Erro");
  } finally {
    salvando = false;
    botaoSalvar.disabled = false;
    botaoSalvar.innerHTML = htmlOriginalBotao;
  }
});

/* ===== INIT ===== */
carregarPet();
