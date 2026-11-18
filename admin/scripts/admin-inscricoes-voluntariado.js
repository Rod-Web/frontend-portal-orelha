// ./admin/scripts/admin-inscricoes-voluntariado.js

import { fetchCapturarInscricoesVoluntariado } from "./requisicao/fetchCapturarInscricoesVoluntariado.js";
import { fetchDeletarInscricaoVoluntariado } from "./requisicao/fetchDeletarInscricaoVoluntariado.js";
import { fetchEditarStatusInscricao } from "./requisicao/fetchEditarStatusInscricao.js";
import { fetchCapturarTrabalhosVoluntarios } from "./requisicao/fetchCapturarTrabalhosVoluntarios.js";

/* =========================================================
   ELEMENTOS
   ========================================================= */
const listaEl = document.getElementById("listaInscricoes");
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

// Modais
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
let inscricoes = [];
let oportunidadesPorId = new Map();
let filtroStatus = "TODAS";
let buscaTexto = "";
let abaHistorico = "APROVADA";

let inscricaoParaAcao = null;
let tipoAcaoPendente = null; // "excluir" | "reanalisar"

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
    return Date.parse(a.data_inscricao) - Date.parse(b.data_inscricao);
  });
}

function ordenarHistorico(lista) {
  return lista
    .slice()
    .sort(
      (a, b) => Date.parse(b.data_inscricao) - Date.parse(a.data_inscricao),
    );
}

/* =========================================================
   FILTRO + BUSCA
   ========================================================= */

function itemPassaFiltro(i) {
  if (filtroStatus !== "TODAS" && i.status !== filtroStatus) return false;
  if (i.status !== "PENDENTE" && i.status !== "EM_ANALISE") return false;

  if (!buscaTexto) return true;

  const alvo = buscaTexto.toLowerCase();
  const nome = (i.nome_completo || "").toLowerCase();
  const email = (i.email || "").toLowerCase();
  const titulo = i._oportunidade?.titulo?.toLowerCase() || "";

  return nome.includes(alvo) || email.includes(alvo) || titulo.includes(alvo);
}

function listaPrincipal() {
  return ordenarPrincipal(inscricoes.filter(itemPassaFiltro));
}

function listaHistorico(status) {
  return ordenarHistorico(inscricoes.filter((i) => i.status === status));
}

/* =========================================================
   CRIAR CARD (lista principal)
   ========================================================= */

function criarCardInscricao(i) {
  const op = i._oportunidade;
  const opTitulo =
    op?.titulo || `Oportunidade #${i.id_oportunidade_voluntario}`;
  const opLocal = op?.local || "Informações indisponíveis";

  const classe = classeStatus(i.status);

  const card = document.createElement("article");
  card.className = "item-solicitacao";
  card.dataset.id = i.id;
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `Ver detalhes da inscrição de ${i.nome_completo}`,
  );

  card.innerHTML = `
        <div class="avatar ${classe}">${escaparHtml(iniciais(i.nome_completo))}</div>

        <div class="item-info">
            <h3>${escaparHtml(i.nome_completo || "Sem nome")}</h3>
            <p class="meta">
                ${i.idade || "—"} anos · ${escaparHtml(i.endereco_residencial || "—")}
            </p>
            <p class="data">
                Inscrito em ${formatarData(i.data_inscricao)}
                · ${diasDesde(i.data_inscricao)}
            </p>
        </div>

        <div class="item-oportunidade">
            <div class="oportunidade-icone">
                <i class="fa-solid fa-hand-holding-heart"></i>
            </div>
            <div class="oportunidade-info">
                <strong>${escaparHtml(opTitulo)}</strong>
                <span>${escaparHtml(opLocal)}</span>
            </div>
        </div>

        <span class="badge-status ${classe}">${labelStatus(i.status)}</span>
    `;

  return card;
}

/* =========================================================
   CRIAR ITEM DO DRAWER (histórico)
   Agora tem DOIS botões: reanalisar + excluir
   ========================================================= */

function criarItemHistorico(i) {
  const opTitulo =
    i._oportunidade?.titulo || `Oportunidade #${i.id_oportunidade_voluntario}`;

  const item = document.createElement("div");
  item.className = "drawer-item";
  item.dataset.id = i.id;

  item.innerHTML = `
        <div class="drawer-item-info">
            <strong>${escaparHtml(i.nome_completo || "Sem nome")}</strong>
            <p>
                ${i.idade || "—"} anos · ${escaparHtml(opTitulo)}
                · ${formatarData(i.data_inscricao)}
            </p>
        </div>

        <div class="drawer-item-acoes">
            <button type="button"
                    class="acao-btn reanalisar"
                    data-id="${i.id}"
                    aria-label="Reanalisar inscrição de ${escaparHtml(i.nome_completo || "")}"
                    title="Voltar para análise">
                <i class="fa-solid fa-rotate-left"></i>
            </button>

            <button type="button"
                    class="acao-btn excluir"
                    data-id="${i.id}"
                    aria-label="Excluir inscrição de ${escaparHtml(i.nome_completo || "")}"
                    title="Excluir do histórico">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
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
    listaEl.innerHTML = `<p class="vazio">Nenhuma inscrição encontrada.</p>`;
    contadorEl.textContent = "";
    return;
  }

  const frag = document.createDocumentFragment();
  lista.forEach((i) => frag.appendChild(criarCardInscricao(i)));
  listaEl.appendChild(frag);

  contadorEl.textContent = `${lista.length} ${
    lista.length === 1 ? "inscrição exibida" : "inscrições exibidas"
  }`;
}

function renderizarDrawer() {
  const lista = listaHistorico(abaHistorico);

  drawerListaEl.innerHTML = "";

  if (!lista.length) {
    drawerListaEl.innerHTML = `<p class="vazio">Nenhuma inscrição ${
      abaHistorico === "APROVADA" ? "aprovada" : "reprovada"
    }.</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  lista.forEach((i) => frag.appendChild(criarItemHistorico(i)));
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
   EVENTOS — CARD CLICÁVEL → detalhes
   ========================================================= */

listaEl?.addEventListener("click", (e) => {
  const card = e.target.closest(".item-solicitacao");
  if (!card) return;

  const id = Number(card.dataset.id);
  window.location.href = `./inscricao-voluntariado.html?id=${id}`;
});

listaEl?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;

  const card = e.target.closest(".item-solicitacao");
  if (!card) return;

  e.preventDefault();
  const id = Number(card.dataset.id);
  window.location.href = `./inscricao-voluntariado.html?id=${id}`;
});

/* =========================================================
   EVENTOS — DRAWER
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
   MODAL — abre para excluir OU reanalisar
   ========================================================= */

function abrirModalExcluir(inscricao) {
  tipoAcaoPendente = "excluir";
  inscricaoParaAcao = inscricao;

  modalTitulo.textContent = "Excluir inscrição?";
  modalTexto.textContent = `A inscrição de "${inscricao.nome_completo}" será removida permanentemente. Essa ação não pode ser desfeita.`;
  btnConfirmar.textContent = "Sim, excluir";
  btnConfirmar.className = "botao-perigo";

  modalEl.hidden = false;
}

function abrirModalReanalisar(inscricao) {
  tipoAcaoPendente = "reanalisar";
  inscricaoParaAcao = inscricao;

  modalTitulo.textContent = "Reanalisar inscrição?";
  modalTexto.textContent = `A inscrição de "${inscricao.nome_completo}" voltará para o status "Em análise" e aparecerá novamente na lista principal.`;
  btnConfirmar.textContent = "Sim, reanalisar";
  btnConfirmar.className = "botao-perigo";

  modalEl.hidden = false;
}

function fecharModal() {
  inscricaoParaAcao = null;
  tipoAcaoPendente = null;
  modalEl.hidden = true;
}

/* =========================================================
   EVENTOS — BOTÕES DO DRAWER
   ========================================================= */

drawerListaEl?.addEventListener("click", (e) => {
  // Botão EXCLUIR
  const btnExcluir = e.target.closest(".acao-btn.excluir");
  if (btnExcluir) {
    const id = Number(btnExcluir.dataset.id);
    const inscricao = inscricoes.find((i) => i.id === id);
    if (!inscricao) return;

    abrirModalExcluir(inscricao);
    return;
  }

  // Botão REANALISAR
  const btnReanalisar = e.target.closest(".acao-btn.reanalisar");
  if (btnReanalisar) {
    const id = Number(btnReanalisar.dataset.id);
    const inscricao = inscricoes.find((i) => i.id === id);
    if (!inscricao) return;

    abrirModalReanalisar(inscricao);
  }
});

/* =========================================================
   EVENTOS — MODAL (cancelar / confirmar)
   ========================================================= */

btnCancelar?.addEventListener("click", fecharModal);

modalEl?.addEventListener("click", (e) => {
  if (e.target === modalEl) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEl.hidden) fecharModal();
});

btnConfirmar?.addEventListener("click", async () => {
  if (!inscricaoParaAcao) return;

  const id = inscricaoParaAcao.id;
  const nome = inscricaoParaAcao.nome_completo;
  const tipo = tipoAcaoPendente;

  btnConfirmar.disabled = true;
  btnCancelar.disabled = true;

  const textoOriginal = btnConfirmar.textContent;
  btnConfirmar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Processando…';

  try {
    if (tipo === "excluir") {
      /* ============ EXCLUIR ============ */
      const resultado = await fetchDeletarInscricaoVoluntariado(id);

      if (resultado.erro) {
        mostrarToast(resultado.erro, "falha");
        return;
      }

      inscricoes = inscricoes.filter((i) => i.id !== id);

      renderizarPrincipal();
      renderizarDrawer();

      const mensagem =
        resultado.mensagem || `Inscrição de "${nome}" excluída com sucesso.`;
      mostrarToast(mensagem, "sucesso");

      fecharModal();
    } else if (tipo === "reanalisar") {
      /* ============ REANALISAR ============ */
      const resultado = await fetchEditarStatusInscricao(id, "EM_ANALISE");

      if (resultado.erro) {
        mostrarToast(resultado.erro, "falha");
        return;
      }

      // Atualiza o objeto em memória
      const alvo = inscricoes.find((i) => i.id === id);
      if (alvo) alvo.status = "EM_ANALISE";

      renderizarPrincipal();
      renderizarDrawer();

      mostrarToast(`"${nome}" voltou para "Em análise".`, "sucesso");

      fecharModal();
    }
  } catch (erro) {
    console.error("Erro na ação:", erro);
    mostrarToast("Não foi possível concluir a ação.", "falha");
  } finally {
    btnConfirmar.disabled = false;
    btnCancelar.disabled = false;
    btnConfirmar.textContent = textoOriginal;
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
  const [resInscricoes, resOportunidades] = await Promise.all([
    fetchCapturarInscricoesVoluntariado(),
    fetchCapturarTrabalhosVoluntarios(),
  ]);

  if (resInscricoes?.erro) {
    listaEl.innerHTML = `<p class="vazio">${resInscricoes.erro}</p>`;
    contadorEl.textContent = "";
    return;
  }

  inscricoes = Array.isArray(resInscricoes) ? resInscricoes : [];

  const oportunidades = Array.isArray(resOportunidades)
    ? resOportunidades
    : resOportunidades?.oportunidades || [];

  oportunidadesPorId = new Map();
  oportunidades.forEach((op) => oportunidadesPorId.set(op.id, op));

  inscricoes.forEach((i) => {
    i._oportunidade =
      oportunidadesPorId.get(i.id_oportunidade_voluntario) || null;
  });

  renderizarPrincipal();
}

carregarTudo();
