// ./admin/scripts/admin-solicitacoes-adocao.js

import { fetchCapturarSolicitacoes } from "./requisicao/fetchCapturarSolicitacoes.js";
import { fetchDeletarSolicitacao } from "./requisicao/fetchDeletarSolicitacao.js";
import { fetchCapturarPets } from "./requisicao/fetchCapturarPets.js";

/* =========================================================
   ELEMENTOS
   ========================================================= */
const listaEl = document.getElementById("listaSolicitacoes");
const contadorEl = document.getElementById("contador");
const buscaEl = document.getElementById("busca");
const filtrosEl = document.getElementById("filtrosStatus");

// Drawer
const abrirHistoricoBtn = document.getElementById("abrirHistorico");
const drawerEl = document.getElementById("drawerHistorico");
const drawerOverlay = document.getElementById("drawerOverlay");
const fecharDrawerBtn = document.getElementById("fecharDrawer");
const drawerTabsEl = document.getElementById("drawerTabs");
const drawerListaEl = document.getElementById("drawerLista");

// Modal (só exclusão)
const modalEl = document.getElementById("modalExcluir");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const btnCancelar = document.getElementById("cancelarExclusao");
const btnConfirmar = document.getElementById("confirmarExclusao");

// Toast
const toastEl = document.getElementById("toast");

/* =========================================================
   ESTADO
   ========================================================= */
let solicitacoes = [];
let petsPorId = new Map();
let filtroStatus = "TODAS";
let buscaTexto = "";
let abaHistorico = "APROVADA";
let solicitacaoParaExcluir = null;

/* =========================================================
   PLACEHOLDER
   ========================================================= */
const PLACEHOLDER_PET =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
  <rect width='80' height='80' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='28' fill='#63291e'>🐾</text>
</svg>
`);

/* =========================================================
   HELPERS
   ========================================================= */

function iniciais(nome) {
  const partes = (nome || "").trim().split(/\s+/);
  if (!partes[0]) return "?";
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatarData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function diasDesde(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

function labelStatus(status) {
  if (status === "PENDENTE") return "Pendente";
  if (status === "EM_ANALISE") return "Em análise";
  if (status === "APROVADA") return "Aprovada";
  if (status === "REPROVADA") return "Reprovada";
  return status;
}

function classeStatus(status) {
  if (status === "PENDENTE") return "pendente";
  if (status === "EM_ANALISE") return "em_analise";
  if (status === "APROVADA") return "aprovada";
  if (status === "REPROVADA") return "reprovada";
  return "";
}

function escaparHtml(texto) {
  return String(texto ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

/* =========================================================
   ORDENAÇÃO
   ========================================================= */

function ordenarPrincipal(lista) {
  return lista.slice().sort((a, b) => {
    const priorA = a.status === "PENDENTE" ? 0 : 1;
    const priorB = b.status === "PENDENTE" ? 0 : 1;
    if (priorA !== priorB) return priorA - priorB;
    return Date.parse(a.data_solicitacao) - Date.parse(b.data_solicitacao);
  });
}

function ordenarHistorico(lista) {
  return lista
    .slice()
    .sort(
      (a, b) => Date.parse(b.data_solicitacao) - Date.parse(a.data_solicitacao),
    );
}

/* =========================================================
   FILTRO + BUSCA
   ========================================================= */

function itemPassaFiltro(s) {
  if (filtroStatus !== "TODAS" && s.status !== filtroStatus) return false;
  if (s.status !== "PENDENTE" && s.status !== "EM_ANALISE") return false;

  if (!buscaTexto) return true;

  const alvo = buscaTexto.toLowerCase();
  const nome = (s.nome_completo || "").toLowerCase();
  const email = (s.email || "").toLowerCase();
  const pet = s._pet?.nome?.toLowerCase() || "";

  return nome.includes(alvo) || email.includes(alvo) || pet.includes(alvo);
}

function listaPrincipal() {
  return ordenarPrincipal(solicitacoes.filter(itemPassaFiltro));
}

function listaHistorico(status) {
  return ordenarHistorico(solicitacoes.filter((s) => s.status === status));
}

/* =========================================================
   CARD DA LISTA PRINCIPAL
   ========================================================= */

function criarCardSolicitacao(s) {
  const pet = s._pet;
  const petNome = pet?.nome || `Pet #${s.id_pet}`;
  const petDescricao = pet
    ? `${pet.raca || "SRD"} · ${pet.especie === "GATO" ? "Gato" : "Cachorro"}`
    : "Informações indisponíveis";
  const petImagem = pet?.imagem || PLACEHOLDER_PET;

  const classe = classeStatus(s.status);

  const card = document.createElement("article");
  card.className = "item-solicitacao";
  card.dataset.id = s.id;
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `Ver detalhes da solicitação de ${s.nome_completo}`,
  );

  card.innerHTML = `
        <div class="avatar ${classe}">${escaparHtml(iniciais(s.nome_completo))}</div>

        <div class="item-info">
            <h3>${escaparHtml(s.nome_completo || "Sem nome")}</h3>
            <p class="meta">
                ${s.idade || "—"} anos · ${escaparHtml(s.endereco_completo || "—")}
            </p>
            <p class="data">
                Solicitado em ${formatarData(s.data_solicitacao)}
                · ${diasDesde(s.data_solicitacao)}
            </p>
        </div>

        <div class="item-pet-preview">
            <div class="pet-foto">
                <img src="${escaparHtml(petImagem)}"
                     alt="${escaparHtml(petNome)}"
                     onerror="this.onerror=null; this.src='${PLACEHOLDER_PET}'">
            </div>
            <div class="pet-info">
                <strong>${escaparHtml(petNome)}</strong>
                <span>${escaparHtml(petDescricao)}</span>
            </div>
        </div>

        <span class="badge-status ${classe}">${labelStatus(s.status)}</span>
    `;

  return card;
}

/* =========================================================
   ITEM DO DRAWER — só visualização + excluir
   ========================================================= */

function criarItemHistorico(s) {
  const petNome = s._pet?.nome || `Pet #${s.id_pet}`;

  const item = document.createElement("div");
  item.className = "drawer-item";
  item.dataset.id = s.id;

  item.innerHTML = `
        <div class="drawer-item-info">
            <strong>${escaparHtml(s.nome_completo || "Sem nome")}</strong>
            <p>
                ${s.idade || "—"} anos · ${escaparHtml(petNome)}
                · ${formatarData(s.data_solicitacao)}
            </p>
        </div>

        <button type="button"
                class="acao-btn excluir"
                data-id="${s.id}"
                aria-label="Excluir solicitação de ${escaparHtml(s.nome_completo || "")}"
                title="Excluir do histórico">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;

  return item;
}

/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */

function renderizarPrincipal() {
  const lista = listaPrincipal();

  listaEl.innerHTML = "";

  if (!lista.length) {
    listaEl.innerHTML = `<p class="vazio">Nenhuma solicitação encontrada.</p>`;
    contadorEl.textContent = "";
    return;
  }

  const frag = document.createDocumentFragment();
  lista.forEach((s) => frag.appendChild(criarCardSolicitacao(s)));
  listaEl.appendChild(frag);

  contadorEl.textContent = `${lista.length} ${
    lista.length === 1 ? "solicitação exibida" : "solicitações exibidas"
  }`;
}

function renderizarDrawer() {
  const lista = listaHistorico(abaHistorico);

  drawerListaEl.innerHTML = "";

  if (!lista.length) {
    drawerListaEl.innerHTML = `<p class="vazio">Nenhuma solicitação ${
      abaHistorico === "APROVADA" ? "aprovada" : "reprovada"
    }.</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  lista.forEach((s) => frag.appendChild(criarItemHistorico(s)));
  drawerListaEl.appendChild(frag);
}

/* =========================================================
   EVENTOS — BUSCA E FILTROS
   ========================================================= */

buscaEl?.addEventListener("input", (e) => {
  buscaTexto = e.target.value.trim();
  renderizarPrincipal();
});

filtrosEl?.addEventListener("click", (e) => {
  const botao = e.target.closest(".filtro");
  if (!botao) return;

  filtrosEl
    .querySelectorAll(".filtro")
    .forEach((b) => b.classList.remove("ativo"));
  botao.classList.add("ativo");

  filtroStatus = botao.dataset.status;
  renderizarPrincipal();
});

/* =========================================================
   EVENTOS — CARD → detalhes
   ========================================================= */

listaEl?.addEventListener("click", (e) => {
  const card = e.target.closest(".item-solicitacao");
  if (!card) return;

  const id = Number(card.dataset.id);
  window.location.href = `./solicitacao-adocao.html?id=${id}`;
});

listaEl?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;

  const card = e.target.closest(".item-solicitacao");
  if (!card) return;

  e.preventDefault();
  const id = Number(card.dataset.id);
  window.location.href = `./solicitacao-adocao.html?id=${id}`;
});

/* =========================================================
   EVENTOS — DRAWER (abrir/fechar/trocar aba)
   ========================================================= */

function abrirDrawer() {
  drawerEl.hidden = false;
  document.body.style.overflow = "hidden";
  renderizarDrawer();
}

function fecharDrawer() {
  drawerEl.hidden = true;
  document.body.style.overflow = "";
}

abrirHistoricoBtn?.addEventListener("click", abrirDrawer);
fecharDrawerBtn?.addEventListener("click", fecharDrawer);
drawerOverlay?.addEventListener("click", fecharDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !drawerEl.hidden) {
    fecharDrawer();
  }
});

drawerTabsEl?.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;

  drawerTabsEl
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("ativo"));
  tab.classList.add("ativo");

  abaHistorico = tab.dataset.tab;
  renderizarDrawer();
});

/* =========================================================
   EVENTOS — EXCLUSÃO (única ação do drawer)
   ========================================================= */

drawerListaEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".acao-btn.excluir");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const solicitacao = solicitacoes.find((s) => s.id === id);
  if (!solicitacao) return;

  solicitacaoParaExcluir = solicitacao;

  modalTitulo.textContent = "Excluir solicitação?";
  modalTexto.textContent = `A solicitação de "${solicitacao.nome_completo}" será removida permanentemente. Essa ação não pode ser desfeita.`;
  btnConfirmar.textContent = "Sim, excluir";

  modalEl.hidden = false;
});

btnCancelar?.addEventListener("click", () => {
  solicitacaoParaExcluir = null;
  modalEl.hidden = true;
});

modalEl?.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    solicitacaoParaExcluir = null;
    modalEl.hidden = true;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEl.hidden) {
    solicitacaoParaExcluir = null;
    modalEl.hidden = true;
  }
});

btnConfirmar?.addEventListener("click", async () => {
  if (!solicitacaoParaExcluir) return;

  const id = solicitacaoParaExcluir.id;
  const nome = solicitacaoParaExcluir.nome_completo;

  btnConfirmar.disabled = true;
  btnCancelar.disabled = true;
  btnConfirmar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo…';

  try {
    const resultado = await fetchDeletarSolicitacao(id);

    if (resultado.erro) {
      mostrarToast(resultado.erro, "falha");
      return;
    }

    solicitacoes = solicitacoes.filter((s) => s.id !== id);

    renderizarPrincipal();
    renderizarDrawer();

    const mensagem =
      resultado.mensagem || `Solicitação de "${nome}" excluída com sucesso.`;
    mostrarToast(mensagem, "sucesso");

    solicitacaoParaExcluir = null;
    modalEl.hidden = true;
  } catch (erro) {
    console.error("Erro ao excluir solicitação:", erro);
    mostrarToast("Não foi possível excluir a solicitação.", "falha");
  } finally {
    btnConfirmar.disabled = false;
    btnCancelar.disabled = false;
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
   CARREGAMENTO
   ========================================================= */

async function carregarTudo() {
  const [resSolicitacoes, resPets] = await Promise.all([
    fetchCapturarSolicitacoes(),
    fetchCapturarPets(),
  ]);

  if (resSolicitacoes?.erro) {
    listaEl.innerHTML = `<p class="vazio">${resSolicitacoes.erro}</p>`;
    contadorEl.textContent = "";
    return;
  }

  solicitacoes = Array.isArray(resSolicitacoes) ? resSolicitacoes : [];

  const pets = Array.isArray(resPets) ? resPets : resPets?.pets || [];

  petsPorId = new Map();
  pets.forEach((p) => petsPorId.set(p.numero_identificacao, p));

  solicitacoes.forEach((s) => {
    s._pet = petsPorId.get(s.id_pet) || null;
  });

  renderizarPrincipal();
}

carregarTudo();
