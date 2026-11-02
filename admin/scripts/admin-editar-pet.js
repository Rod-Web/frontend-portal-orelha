// scripts/admin-editar-pet.js

import { mostrarAviso } from "./components/modal.js";
import { fetchEditarPet } from "./requisicao/fetchEditarPet.js";

const API_URL = "http://localhost:3000";

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
const loadingEl = document.getElementById("loading");
const formContainer = document.getElementById("formContainer");
const form = document.getElementById("formEditarPet");
const petIdEl = document.getElementById("petId");
const petNomeEl = document.getElementById("petNome");
const dataCadastroEl = document.getElementById("dataCadastro");
const preview = document.getElementById("previewImagem");
const inputFile = document.getElementById("inputImagem");
const nomeArquivoEl = document.getElementById("nomeArquivo");

const campoNome = document.getElementById("nome");
const campoEspecie = document.getElementById("especie");
const campoRaca = document.getElementById("raca");
const campoSexo = document.getElementById("sexo");
const campoPeso = document.getElementById("peso");
const campoQuantidade = document.getElementById("idadeQuantidade");
const campoUnidade = document.getElementById("idadeUnidade");
const campoStatus = document.getElementById("status");
const campoDescricao = document.getElementById("descricao");
const contadorDescricao = document.getElementById("contadorDescricao");

/* ===== URL ===== */
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

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

/* ===== CARREGAR ===== */
async function buscarPet(petId) {
  const urls = [
    `${API_URL}/pet/${petId}`,
    `${API_URL}/pet/numero_identificacao/${petId}`,
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
    mostrarAviso("ID do pet não informado na URL.", "./catalogo.html", "Erro");
    return;
  }

  try {
    const pet = await buscarPet(id);

    if (!pet) {
      mostrarAviso("Pet não encontrado.", "./catalogo.html", "Erro");
      return;
    }

    preencherFormulario(pet);
  } catch (erro) {
    console.error("Erro ao carregar pet:", erro);
    loadingEl.innerHTML = `
      <p>Não foi possível carregar os dados do pet.</p>
      <p style="margin-top:12px">
        <a href="./catalogo.html" style="color:#a92d17;font-weight:700">Voltar ao catálogo</a>
      </p>
    `;
  }
}

function preencherFormulario(pet) {
  petIdEl.textContent = pet.numero_identificacao;
  petNomeEl.textContent = pet.nome || "—";
  dataCadastroEl.textContent = formatarData(pet.data_cadastro);

  preview.src = pet.imagem || PLACEHOLDER;
  preview.alt = `Foto de ${pet.nome || "pet"}`;
  preview.onerror = () => {
    preview.onerror = null;
    preview.src = PLACEHOLDER;
  };

  campoNome.value = pet.nome || "";
  campoRaca.value = pet.raca || "";
  campoPeso.value = pet.peso ? parseFloat(pet.peso) : "";
  campoDescricao.value = pet.descricao || "";
  contadorDescricao.textContent = campoDescricao.value.length;

  selecionarOuAdicionar(campoEspecie, pet.especie, "Outro");
  selecionarOuAdicionar(campoSexo, pet.sexo, "Outro");
  selecionarOuAdicionar(campoStatus, pet.status, "Outro");

  const idade = decomporIdade(pet.idade_aproximada_em_dias);
  campoQuantidade.value = idade.quantidade;
  campoUnidade.value = idade.unidade;

  loadingEl.hidden = true;
  formContainer.hidden = false;
}

/* ===== PREVIEW DE IMAGEM ===== */
inputFile.addEventListener("change", () => {
  const arquivo = inputFile.files[0];

  if (!arquivo) {
    nomeArquivoEl.textContent = "";
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    mostrarAviso("Por favor, selecione um arquivo de imagem.", null, "Erro");
    inputFile.value = "";
    nomeArquivoEl.textContent = "";
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarAviso("A imagem é muito grande (máx. 5 MB).", null, "Erro");
    inputFile.value = "";
    nomeArquivoEl.textContent = "";
    return;
  }

  if (preview.dataset.blobUrl) {
    URL.revokeObjectURL(preview.dataset.blobUrl);
  }

  const url = URL.createObjectURL(arquivo);
  preview.src = url;
  preview.onerror = null;
  preview.dataset.blobUrl = url;
  nomeArquivoEl.textContent = arquivo.name;
});

/* ===== CONTADOR DE DESCRIÇÃO ===== */
campoDescricao.addEventListener("input", () => {
  contadorDescricao.textContent = campoDescricao.value.length;
});

/* ===== SUBMIT ===== */
let salvando = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (salvando) return;

  /* Validações */
  if (!campoNome.value.trim()) {
    mostrarAviso("O nome é obrigatório.", null, "Erro");
    campoNome.focus();
    return;
  }

  const peso = parseFloat(campoPeso.value);
  if (!Number.isFinite(peso) || peso <= 0) {
    mostrarAviso("O peso deve ser um número maior que zero.", null, "Erro");
    campoPeso.focus();
    return;
  }

  const quantidade = parseInt(campoQuantidade.value, 10);
  if (!Number.isFinite(quantidade) || quantidade < 0) {
    mostrarAviso("A quantidade de idade deve ser ≥ 0.", null, "Erro");
    campoQuantidade.focus();
    return;
  }

  /* Bloqueio de duplo envio */
  salvando = true;
  const btnSalvar = form.querySelector('button[type="submit"]');
  if (btnSalvar) {
    btnSalvar.disabled = true;
    btnSalvar.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Salvando…';
  }

  try {
    const formData = new FormData();

    formData.append("nome", campoNome.value.trim());
    formData.append("especie", campoEspecie.value);
    formData.append("raca", campoRaca.value.trim());
    formData.append("sexo", campoSexo.value);
    formData.append("peso", String(peso));
    formData.append("status", campoStatus.value);
    formData.append("descricao", campoDescricao.value.trim());

    /* ⚠️ Se o backend esperar o contrário (unidade = "meses", grandeza = 3),
       basta inverter as duas linhas abaixo. */
    formData.append("unidade_idade", String(quantidade)); // 3
    formData.append("grandeza_idade", campoUnidade.value); // "meses"

    const arquivo = inputFile.files[0];
    if (arquivo) {
      formData.append("image", arquivo);
    }

    /* Chama o fetch isolado */
    const response = await fetchEditarPet(id, formData);

    if (response.erro) {
      mostrarAviso(response.erro, null, "Erro");
      return;
    }

    mostrarAviso("Pet atualizado com sucesso!", "./catalogo.html", "Sucesso");
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    mostrarAviso(
      "Não foi possível salvar as alterações. Tente novamente.",
      null,
      "Erro",
    );
  } finally {
    salvando = false;
    if (btnSalvar) {
      btnSalvar.disabled = false;
      btnSalvar.innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
    }
  }
});

/* ===== INIT ===== */
carregarPet();
