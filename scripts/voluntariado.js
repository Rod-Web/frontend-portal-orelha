// scripts/voluntariado.js

import url from "../../ambiente.js";

const API_URL = `${url}/trabalhos-voluntario`;

const corpo = document.getElementById("corpoVoluntariado");
const contadorVagas = document.getElementById("contadorVagas");
const campoBusca = document.getElementById("campoBusca");
const limparBusca = document.getElementById("limparBusca");

/* =========================================================
   ESTADO
   ========================================================= */
let vagas = [];
let termoBusca = "";

/* =========================================================
   STATUS
   ========================================================= */
const STATUS_INFO = {
  ABERTA: { texto: "Aberta", classe: "vaga-status--aberta" }
};

/* =========================================================
   UTILIDADES
   ========================================================= */


function dataCompleta(iso) {
  if (!iso || typeof iso !== "string") return "data não informada";

  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "data não informada";

  const data = new Date(`${ano}-${mes}-${dia}T12:00:00`);
  if (Number.isNaN(data.getTime())) return "data não informada";

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resumoDescricao(descricao, limite = 130) {
  if (!descricao) return "";
  const texto = String(descricao).trim();
  if (texto.length <= limite) return texto;
  return texto.slice(0, limite).trimEnd() + "…";
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */
function irParaDetalhes(id) {
  if (!id) return;
  window.location.href = `./detalhes_voluntariado.html?id=${id}`;
}

/* =========================================================
   FILTRAGEM (só busca por texto, já que status é fixo)
   ========================================================= */
function filtrarVagas() {
  const buscaNorm = normalizarTexto(termoBusca);

  if (!buscaNorm) return vagas;

  return vagas.filter((vaga) => {
    const alvo = normalizarTexto(
      `${vaga.titulo || ""} ${vaga.local || ""} ${vaga.descricao || ""}`,
    );
    return alvo.includes(buscaNorm);
  });
}

/* =========================================================
   CARD
   ========================================================= */
function criarCard(vaga, indice) {
  const status = STATUS_INFO[vaga.status] || STATUS_INFO.ABERTA;
  const data = dataCompleta(vaga.data_inicio);
  const numero = String(indice + 1).padStart(2, "0");

  const card = document.createElement("article");
  card.className = "vaga-card";
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `${vaga.titulo}. Status ${status.texto}. Local: ${vaga.local}. ` +
      `Início: ${data}. Jornada: ${vaga.jornada}. Clique para ver detalhes.`,
  );

  card.innerHTML = `
        <div class="vaga-topo">
            <span class="vaga-numero" aria-hidden="true">${numero}</span>
            <span class="vaga-status ${status.classe}">${status.texto}</span>
        </div>

        <h3 class="vaga-titulo">${escapeHtml(vaga.titulo)}</h3>

        <p class="vaga-resumo">${escapeHtml(resumoDescricao(vaga.descricao))}</p>

        <div class="vaga-meta">
            <span>
                <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                ${escapeHtml(vaga.local)}
            </span>
            <span>
                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                ${escapeHtml(vaga.jornada)}
            </span>
        </div>

        <div class="vaga-data">
            <span>
                <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                Início em ${escapeHtml(data)}
            </span>
            <span class="vaga-seta" aria-hidden="true">
                <i class="fa-solid fa-arrow-right"></i>
            </span>
        </div>
    `;

  card.addEventListener("click", () => irParaDetalhes(vaga.id));

  card.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      irParaDetalhes(vaga.id);
    }
  });

  return card;
}

/* =========================================================
   RENDER
   ========================================================= */
function renderizar(lista) {
  if (!corpo) return;

  corpo.innerHTML = "";

  if (!lista.length) {
    corpo.innerHTML = `
      <p class="vagas-mensagem">
        <i class="fa-solid fa-seedling" aria-hidden="true"></i>
        ${
          termoBusca
            ? "Nenhuma vaga encontrada para essa busca."
            : "Nenhuma vaga disponível no momento."
        }
      </p>
    `;
    if (contadorVagas) {
      contadorVagas.textContent = termoBusca ? "0 resultados" : "0 vagas";
    }
    return;
  }

  const fragmento = document.createDocumentFragment();
  lista.forEach((vaga, i) => fragmento.appendChild(criarCard(vaga, i)));
  corpo.appendChild(fragmento);

  if (contadorVagas) {
    contadorVagas.textContent = `${lista.length} ${lista.length === 1 ? "vaga" : "vagas"}`;
  }
}

function aplicarBusca() {
  renderizar(filtrarVagas());
}

/* =========================================================
   BUSCA
   ========================================================= */
campoBusca?.addEventListener("input", () => {
  termoBusca = campoBusca.value.trim();
  if (limparBusca) limparBusca.hidden = termoBusca.length === 0;
  aplicarBusca();
});

limparBusca?.addEventListener("click", () => {
  if (campoBusca) {
    campoBusca.value = "";
    campoBusca.focus();
  }
  termoBusca = "";
  if (limparBusca) limparBusca.hidden = true;
  aplicarBusca();
});

/* =========================================================
   CARREGAR VAGAS
   ========================================================= */
async function carregarVagas() {
  if (!corpo) return;

  try {
    corpo.innerHTML = `<p class="vagas-mensagem">Carregando vagas…</p>`;

    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const brutos = await resposta.json();

    vagas = (Array.isArray(brutos) ? brutos : [])
      .filter((v) => v && v.id != null)
      .filter((v) => v.status === "ABERTA") // ← só abertas
      .sort((a, b) =>
        String(a.data_inicio || "").localeCompare(String(b.data_inicio || "")),
      );

    aplicarBusca();
  } catch (erro) {
    console.error("Erro ao carregar vagas:", erro);
    if (corpo) {
      corpo.innerHTML = `
        <p class="vagas-mensagem">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          Não foi possível carregar as vagas. Verifique se a API está
          rodando em ${escapeHtml(url)}.
        </p>
      `;
    }
    if (contadorVagas) contadorVagas.textContent = "—";
  }
}

carregarVagas();
