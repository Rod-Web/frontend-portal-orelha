// ./admin/scripts/pets.js
import { fetchCapturarPets } from "./requisicao/fetchCapturarPets.js";

/* =========================================================
   ELEMENTOS
   ========================================================= */
const listaEl = document.getElementById("listaGerenciar");
const contadorEl = document.getElementById("contador");
const buscaEl = document.getElementById("busca");
const filtrosEl = document.getElementById("filtrosStatus");

const modalEl = document.getElementById("modalExcluir");
const modalTexto = document.getElementById("modalTexto");
const btnCancelar = document.getElementById("cancelarExclusao");
const btnConfirmar = document.getElementById("confirmarExclusao");

const toastEl = document.getElementById("toast");

/* =========================================================
   ESTADO
   ========================================================= */
let pets = [];
let filtroStatus = "todos";
let buscaTexto = "";
let petParaExcluir = null;

/* =========================================================
   PLACEHOLDER (imagem quebrada → pata)
   ========================================================= */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
  <rect width='120' height='120' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='32' fill='#63291e'>🐾</text>
</svg>
`);

/* =========================================================
   HELPERS
   ========================================================= */
function capitalizar(t) {
  return t ? t.charAt(0) + t.slice(1).toLowerCase() : "—";
}

function formatarSexo(s) {
  if (!s) return "—";
  const v = s.toUpperCase();
  return v === "FEMEA" || v === "FÊMEA" ? "Fêmea" : "Macho";
}

function statusInfo(status) {
  const v = (status || "").toUpperCase();
  if (v === "ADOTADO") return { texto: "Adotado", classe: "adotado" };
  if (v === "EM_PROCESSO") return {texto: "Em processo", classe: "em_processo"}
  return { texto: "Disponível", classe: "disponivel" };
}

function formatarPeso(peso) {
  const n = parseFloat(peso);
  if (isNaN(n)) return null;
  return `${n.toFixed(1).replace(".", ",")} kg`;
}

/* =========================================================
   CRIAR O HTML DE UM PET
   ========================================================= */
function criarItem(pet) {
  const s = statusInfo(pet.status);
  const pesoTexto = formatarPeso(pet.peso);

  const item = document.createElement("article");
  item.className = "item-pet";
  item.dataset.id = pet.numero_identificacao;

  item.innerHTML = `
        <div class="foto">
            <img src="${pet.imagem || PLACEHOLDER}" alt="${pet.nome || "Pet"}"
                 onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
        </div>
        <div class="item-dados">
            <h3>${pet.nome || "Sem nome"}</h3>
            <p class="meta">
                ${capitalizar(pet.especie)} · ${formatarSexo(pet.sexo)} · ${pet.idade || "—"}
                ${pet.raca ? " · " + pet.raca : ""}
            </p>
            <div class="item-tags">
                <span class="tag ${s.classe}">${s.texto}</span>
                ${pesoTexto ? `<span class="tag">${pesoTexto}</span>` : ""}
            </div>
        </div>
        <div class="item-acoes">
            <a class="acao-btn" href="./editar-pet.html?id=${pet.numero_identificacao}"
               title="Editar pet" aria-label="Editar ${pet.nome || "pet"}">
                <i class="fa-solid fa-pen"></i>
            </a>
            <button type="button" class="acao-btn excluir"
                    data-id="${pet.numero_identificacao}"
                    title="Excluir pet" aria-label="Excluir ${pet.nome || "pet"}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `;

  return item;
}

/* =========================================================
   FILTRAR
   ========================================================= */
function petPassaFiltro(pet) {
  if (filtroStatus !== "todos") {
    if ((pet.status || "").toUpperCase() !== filtroStatus) return false;
  }
  if (!buscaTexto) return true;

  const alvo = buscaTexto.toLowerCase();
  return (
    (pet.nome || "").toLowerCase().includes(alvo) ||
    (pet.raca || "").toLowerCase().includes(alvo) ||
    (pet.especie || "").toLowerCase().includes(alvo)
  );
}

/* =========================================================
   RENDERIZAR
   ========================================================= */
function renderizar() {
  const filtrados = pets.filter(petPassaFiltro);

  listaEl.innerHTML = "";

  if (!filtrados.length) {
    listaEl.innerHTML = `<p class="vazio">Nenhum pet encontrado.</p>`;
    contadorEl.textContent = "";
    return;
  }

  /* DocumentFragment evita reflow a cada append */
  const frag = document.createDocumentFragment();
  filtrados.forEach((pet) => frag.appendChild(criarItem(pet)));
  listaEl.appendChild(frag);

  contadorEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? "pet exibido" : "pets exibidos"}`;
}

/* =========================================================
   BUSCA E FILTROS
   ========================================================= */
buscaEl?.addEventListener("input", (e) => {
  buscaTexto = e.target.value.trim();
  renderizar();
});

filtrosEl?.addEventListener("click", (e) => {
  const botao = e.target.closest(".filtro");
  if (!botao) return;

  filtrosEl
    .querySelectorAll(".filtro")
    .forEach((b) => b.classList.remove("ativo"));
  botao.classList.add("ativo");

  filtroStatus = botao.dataset.status;
  renderizar();
});

/* =========================================================
   EXCLUSÃO (modal + DELETE)
   ========================================================= */
listaEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".acao-btn.excluir");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const pet = pets.find((p) => p.numero_identificacao === id);
  if (!pet) return;

  petParaExcluir = pet;
  modalTexto.textContent = `"${pet.nome}" será removido permanentemente. Essa ação não pode ser desfeita.`;
  modalEl.hidden = false;
});

btnCancelar?.addEventListener("click", () => {
  petParaExcluir = null;
  modalEl.hidden = true;
});

modalEl?.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    petParaExcluir = null;
    modalEl.hidden = true;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEl.hidden) {
    petParaExcluir = null;
    modalEl.hidden = true;
  }
});

import url from '../../ambiente.js';
btnConfirmar?.addEventListener("click", async () => {
  if (!petParaExcluir) return;

  const id = petParaExcluir.numero_identificacao;
  const nome = petParaExcluir.nome;

  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo…';

  try {

    const resposta = await fetch(
      `${url}/rotasprivadas/pet/${id}`,
      { method: "DELETE", credentials: "include" },
    );

    if (!resposta.ok && resposta.status !== 204) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    console.log(resposta)

    pets = pets.filter((p) => p.numero_identificacao !== id);
    renderizar();
    mostrarToast(`"${nome}" foi excluído.`, "sucesso");

    petParaExcluir = null;
    modalEl.hidden = true;
  } catch (erro) {
    console.error("Erro ao excluir pet:", erro);
    mostrarToast("Não foi possível excluir o pet.", "falha");
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "Sim, excluir";
  }
});

/* =========================================================
   TOAST
   ========================================================= */
let toastTimer = null;

function mostrarToast(mensagem, tipo = "sucesso") {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.textContent = mensagem;
  toastEl.className = `toast ${tipo}`;
  toastEl.hidden = false;
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3200);
}

/* =========================================================
   CARREGAR PETS
   ========================================================= */
async function carregarPets() {
  const retorno = await fetchCapturarPets();

  if (retorno?.erro) {
    console.error("Falha ao carregar pets:", retorno.erro);
    listaEl.innerHTML = `<p class="vazio">${retorno.erro}</p>`;
    contadorEl.textContent = "";
    return;
  }

  /* Suporta array puro ou objeto com .pets */
  pets = Array.isArray(retorno) ? retorno : retorno.pets || [];

  renderizar();
}

/* =========================================================
   INICIALIZA
   ========================================================= */
carregarPets();
