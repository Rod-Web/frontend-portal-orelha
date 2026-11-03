// scripts/catalogo.js

import url from "../../ambiente.js";

const API_URL = `${url}/pet`;

const listaPets = document.getElementById("listaPets");
const botaoFiltro = document.getElementById("botaoFiltro");
const painelFiltros = document.getElementById("filtros");
const limparFiltro = document.getElementById("limparFiltro");
const mensagem = document.getElementById("mensagem");



let pets = [];

/* =========================================================
   PLACEHOLDER (SVG — nunca dá 404)
   ========================================================= */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
  <rect width='600' height='600' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='72' fill='#63291e'>🐾</text>
</svg>
`);

/* =========================================================
   CONSTANTES DE TEMPO
   ========================================================= */
const DIAS_POR_ANO = 365;
const DIAS_POR_MES = 30.44;
const DIAS_POR_SEMANA = 7;

/* =========================================================
   PORTE — faixas por espécie (em kg)
   ========================================================= */
const FAIXAS_PORTE = {
  CACHORRO: { pequeno: 10, medio: 25 }, // > 25 kg = grande
  GATO: { pequeno: 4, medio: 6 }, // > 6  kg = grande
};

/* Fallback para espécies desconhecidas — usa faixas de cachorro */
const FAIXA_PADRAO = { pequeno: 10, medio: 25 };

/* Normaliza a string da espécie (remove acento, caixa) e casa por substring */
function faixaDaEspecie(especie) {
  const chave = String(especie || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (chave.includes("GATO") || chave.includes("FELINO"))
    return FAIXAS_PORTE.GATO;
  if (
    chave.includes("CACHORRO") ||
    chave.includes("CAO") ||
    chave.includes("CANINO")
  )
    return FAIXAS_PORTE.CACHORRO;

  return FAIXA_PADRAO;
}

/* Retorna "Pequeno" | "Médio" | "Grande" */
function classePorte(pesoKg, especie) {
  const faixa = faixaDaEspecie(especie);
  if (pesoKg <= faixa.pequeno) return "Pequeno";
  if (pesoKg <= faixa.medio) return "Médio";
  return "Grande";
}

/* =========================================================
   IDADE — faixas por dias
   ========================================================= */

/* Retorna "1" | "2" | "3" | "mais" | null (desconhecida) */
function classeIdade(dias) {
  if (dias === null || dias === undefined) return null;
  if (dias <= DIAS_POR_ANO) return "1"; // até 1 ano
  if (dias <= 5 * DIAS_POR_ANO) return "2"; // 1–5 anos
  if (dias <= 10 * DIAS_POR_ANO) return "3"; // 5–10 anos
  return "mais"; // 10+ anos
}

/* Idade humanizada a partir de dias */
function idadeTexto(pet) {
  const dias = pet._dias;
  if (dias === null) return "—";

  if (dias < DIAS_POR_SEMANA) {
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }
  if (dias < DIAS_POR_MES) {
    const sem = Math.floor(dias / DIAS_POR_SEMANA);
    return `${sem} ${sem === 1 ? "semana" : "semanas"}`;
  }
  if (dias < DIAS_POR_ANO) {
    const meses = Math.round(dias / DIAS_POR_MES);
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }
  const anos = Math.floor(dias / DIAS_POR_ANO);
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

/* =========================================================
   FAVORITOS
   ========================================================= */
let favoritos;
try {
  favoritos = new Set(JSON.parse(localStorage.getItem("favoritos") || "[]"));
} catch {
  favoritos = new Set();
}

/* =========================================================
   UTILIDADES GERAIS
   ========================================================= */
function capitalizar(texto) {
  return texto ? texto.charAt(0) + texto.slice(1).toLowerCase() : "";
}

function formatarSexo(sexo) {
  if (sexo === "FEMEA" || sexo === "FÊMEA") return "Fêmea";
  if (sexo === "MACHO") return "Macho";
  return "—";
}

function resumoDescricao(descricao) {
  if (!descricao) return "Carinhoso";
  const resumo = descricao.split(/[,.]/)[0].trim().slice(0, 24);
  return resumo || "Carinhoso";
}

/* =========================================================
   NORMALIZAÇÃO — roda uma vez, na carga
   ========================================================= */
function normalizarPet(pet) {
  const dias = Number(pet.idade_aproximada_em_dias);
  const peso = parseFloat(pet.peso);
  const _peso = Number.isFinite(peso) ? peso : 0;

  return {
    ...pet,
    _dias: Number.isFinite(dias) && dias >= 0 ? dias : null,
    _peso,
    _porte: classePorte(_peso, pet.especie),
  };
}

/* =========================================================
   RENDER
   ========================================================= */
function criarCard(pet) {
  const sexoTexto = formatarSexo(pet.sexo);
  const sexoIcone = sexoTexto === "Fêmea" ? "♀" : "♂";

  const card = document.createElement("article");
  card.className = "pet";
  card.dataset.tipo = capitalizar(pet.especie);
  card.dataset.sexo = sexoTexto;
  card.dataset.porte = pet._porte;
  card.dataset.idade = classeIdade(pet._dias) ?? "";

  const favorito = favoritos.has(pet.numero_identificacao);

  card.innerHTML = `
        <div class="foto">
            <img src="${pet.imagem || PLACEHOLDER}" alt="${pet.nome}"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
            <span class="tipo">${capitalizar(pet.especie)}</span>
            <button class="coracao ${favorito ? "favorito" : ""}"
                    type="button"
                    aria-label="${favorito ? "Remover dos favoritos" : "Favoritar"} ${pet.nome}"
                    aria-pressed="${favorito}"
                    data-id="${pet.numero_identificacao}">
                ${favorito ? "♥" : "♡"}
            </button>
        </div>
        <div class="info">
            <div class="nome">
                <h3>${pet.nome}</h3>
                <span>${sexoIcone}</span>
            </div>
            <p>${idadeTexto(pet)} · Porte ${pet._porte.toLowerCase()}</p>
            <div class="rodape">
                <span>${resumoDescricao(pet.descricao)}</span>
                <a class="detalhes" href="./detalhes_pet.html?id=${pet.numero_identificacao}">
                    Conhecer →
                </a>
            </div>
        </div>
    `;

  return card;
}

function renderizarPets(lista) {
  if (!listaPets) return;

  listaPets.innerHTML = "";

  if (!lista.length) {
    if (mensagem)
      mensagem.textContent = "Nenhum pet encontrado com esses filtros.";
    return;
  }

  if (mensagem) mensagem.textContent = "";

  const fragmento = document.createDocumentFragment();
  lista.forEach((pet) => fragmento.appendChild(criarCard(pet)));
  listaPets.appendChild(fragmento);
}

/* =========================================================
   FILTROS
   ========================================================= */
function obterValorFiltro(nome) {
  const selecionado = document.querySelector(`input[name="${nome}"]:checked`);
  return selecionado ? selecionado.value : "todos";
}

function aplicarFiltros() {
  const animal = obterValorFiltro("animal");
  const sexo = obterValorFiltro("sexo");
  const porte = obterValorFiltro("porte");
  const idade = obterValorFiltro("idade");

  const filtrados = pets.filter((pet) => {
    const tipo = capitalizar(pet.especie);
    const sexoTexto = formatarSexo(pet.sexo);
    const idadeClasse = classeIdade(pet._dias); // pode ser null

    return (
      (animal === "todos" || tipo === animal) &&
      (sexo === "todos" || sexoTexto === sexo) &&
      (porte === "todos" || pet._porte === porte) &&
      (idade === "todos" || idadeClasse === idade)
    );
  });

  renderizarPets(filtrados);
}

/* =========================================================
   PAINEL DE FILTROS
   ========================================================= */
botaoFiltro?.addEventListener("click", () => {
  const aberto = painelFiltros.classList.toggle("aberto");
  botaoFiltro.setAttribute("aria-expanded", aberto);
});

painelFiltros
  ?.querySelectorAll("input[type=radio]")
  .forEach((input) => input.addEventListener("change", aplicarFiltros));

limparFiltro?.addEventListener("click", () => {
  const grupos = new Set();
  painelFiltros?.querySelectorAll("input[type=radio]").forEach((radio) => {
    if (!grupos.has(radio.name)) {
      radio.checked = true;
      grupos.add(radio.name);
    }
  });
  aplicarFiltros();
});

/* =========================================================
   FAVORITOS (event delegation)
   ========================================================= */
listaPets?.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".coracao");
  if (!botao) return;

  const id = Number(botao.dataset.id);
  const jaFavorito = favoritos.has(id);

  if (jaFavorito) favoritos.delete(id);
  else favoritos.add(id);

  botao.classList.toggle("favorito", !jaFavorito);
  botao.textContent = jaFavorito ? "♡" : "♥";
  botao.setAttribute("aria-pressed", String(!jaFavorito));

  const nome = botao.closest(".pet")?.querySelector("h3")?.textContent ?? "";
  botao.setAttribute(
    "aria-label",
    `${jaFavorito ? "Favoritar" : "Remover dos favoritos"} ${nome}`.trim(),
  );

  localStorage.setItem("favoritos", JSON.stringify([...favoritos]));
});

/* =========================================================
   CARREGAR PETS DA API
   ========================================================= */

async function carregarPets() {
  if (!listaPets) return;

  try {
    if (mensagem) mensagem.textContent = "Carregando pets…";

    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const brutos = await resposta.json();

    pets = brutos
      .filter((p) => p && p.numero_identificacao != null)
      .filter((p) => p.status === "DISPONIVEL")
      .map(normalizarPet);

    if (mensagem) mensagem.textContent = "";
    aplicarFiltros();
  } catch (erro) {
    console.error("Erro ao carregar pets:", erro);
    if (mensagem) {
      mensagem.textContent =
        `Não foi possível carregar os pets. Verifique se a API está rodando em ${url}.`;
    }
  }
}

carregarPets();
