// scripts/admin-servicos-voluntarios.js

import { mostrarAviso } from "./components/modal.js";
import { fetchCapturarTrabalhosVoluntarios } from "./requisicao/fetchCapturarTrabalhosVoluntarios.js";
import { fetchExcluirTrabalhoVoluntario } from "./requisicao/fetchExcluirTrabalhoVoluntario.js";

/* ===== ELEMENTOS ===== */
const lista = document.getElementById("listaGerenciar");
const busca = document.getElementById("busca");
const filtrosStatus = document.querySelectorAll(".filtro");
const contador = document.getElementById("contador");
const modalExcluir = document.getElementById("modalExcluir");
const modalTexto = document.getElementById("modalTextoExclusao");
const btnCancelar = document.getElementById("cancelarExclusao");
const btnConfirmar = document.getElementById("confirmarExclusao");
const toast = document.getElementById("toast");

/* ===== ESTADO ===== */
let servicos = [];
let termoBusca = "";
let statusFiltro = "todos";
let idParaExcluir = null;

/* ===== STATUS ===== */
const STATUS_LABEL = {
  ABERTA: { texto: "Aberta", classe: "status-badge--aberta" },
  ENCERRADA: { texto: "Encerrada", classe: "status-badge--encerrada" },
};

/* ===== UTILIDADES ===== */
const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function dataCurta(iso) {
  if (!iso || typeof iso !== "string") return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ===== TOAST ===== */
let toastTimer = null;
function mostrarToast(mensagem, tipo = "sucesso") {
  if (!toast) return;
  toast.textContent = mensagem;
  toast.className = `toast toast--${tipo}`;
  toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

/* ===== FILTRAR ===== */
function filtrarServicos() {
  const buscaNorm = normalizarTexto(termoBusca);

  return servicos.filter((s) => {
    if (statusFiltro !== "todos" && s.status !== statusFiltro) return false;
    if (buscaNorm) {
      const alvo = normalizarTexto(s.titulo || "");
      if (!alvo.includes(buscaNorm)) return false;
    }
    return true;
  });
}

/* ===== CARD ===== */
function criarCard(servico) {
  const status = STATUS_LABEL[servico.status] || {
    texto: servico.status || "—",
    classe: "status-badge--encerrada",
  };

  const card = document.createElement("article");
  card.className = "servico-card";
  card.dataset.id = servico.id;

  card.innerHTML = `
        <div class="servico-info">
            <div class="servico-topo">
                <h3 class="servico-titulo">${escapeHtml(servico.titulo || "Sem título")}</h3>
                <span class="status-badge ${status.classe}">${status.texto}</span>
            </div>

            <div class="servico-meta">
                <span>
                    <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                    ${escapeHtml(servico.local || "—")}
                </span>
                <span>
                    <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                    Início: ${escapeHtml(dataCurta(servico.data_inicio))}
                </span>
                <span>
                    <i class="fa-regular fa-clock" aria-hidden="true"></i>
                    ${escapeHtml(servico.jornada || "—")}
                </span>
            </div>
        </div>

        <div class="servico-acoes">
            <a
                class="btn-acao btn-acao--editar"
                href="./editar-trabalho-voluntario.html?id=${servico.id}"
                aria-label="Editar ${escapeHtml(servico.titulo || "serviço")}"
                title="Editar"
            >
                <i class="fa-solid fa-pen"></i>
            </a>
            <button
                type="button"
                class="btn-acao btn-acao--excluir"
                data-id="${servico.id}"
                data-titulo="${escapeHtml(servico.titulo || "")}"
                aria-label="Excluir ${escapeHtml(servico.titulo || "serviço")}"
                title="Excluir"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

  return card;
}

/* ===== RENDER ===== */
function renderizar(listaServicos) {
  if (!lista) return;

  lista.innerHTML = "";

  if (!listaServicos.length) {
    lista.innerHTML = `
      <p class="sem-resultado">
        <i class="fa-solid fa-seedling" style="display:block;font-size:22px;color:#a94b2b;margin-bottom:10px"></i>
        ${
          termoBusca || statusFiltro !== "todos"
            ? "Nenhum serviço encontrado com esses filtros."
            : "Nenhum serviço voluntário cadastrado ainda."
        }
      </p>
    `;
    atualizarContador(0, listaServicos.length);
    return;
  }

  const fragmento = document.createDocumentFragment();
  listaServicos.forEach((s) => fragmento.appendChild(criarCard(s)));
  lista.appendChild(fragmento);

  atualizarContador(listaServicos.length, servicos.length);
}

function atualizarContador(visiveis, total) {
  if (!contador) return;

  if (visiveis === total) {
    contador.textContent = `${total} ${total === 1 ? "serviço cadastrado" : "serviços cadastrados"}`;
  } else {
    contador.textContent = `${visiveis} de ${total} ${total === 1 ? "serviço" : "serviços"}`;
  }
}

function aplicarFiltros() {
  renderizar(filtrarServicos());
}

/* ===== BUSCA ===== */
busca?.addEventListener("input", () => {
  termoBusca = busca.value.trim();
  aplicarFiltros();
});

/* ===== FILTROS DE STATUS ===== */
filtrosStatus.forEach((btn) => {
  btn.addEventListener("click", () => {
    filtrosStatus.forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    statusFiltro = btn.dataset.status || "todos";
    aplicarFiltros();
  });
});

/* ===== EXCLUSÃO ===== */
function abrirModalExcluir(id, titulo) {
  idParaExcluir = id;
  if (modalTexto) {
    modalTexto.textContent = titulo
      ? `Excluir "${titulo}"? Essa ação não pode ser desfeita.`
      : "Essa ação não pode ser desfeita.";
  }
  modalExcluir.hidden = false;

  /* Foco no botão "Sim, excluir" pra confirmar com Enter */
  btnConfirmar?.focus();
}

function fecharModalExcluir() {
  modalExcluir.hidden = true;
  idParaExcluir = null;
}

/* Delegação — pega o clique de qualquer .btn-acao--excluir */
lista?.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".btn-acao--excluir");
  if (!botao) return;

  const id = Number(botao.dataset.id);
  const titulo = botao.dataset.titulo || "";
  abrirModalExcluir(id, titulo);
});

/* Cancelar */
btnCancelar?.addEventListener("click", fecharModalExcluir);

/* Fechar clicando fora */
modalExcluir?.addEventListener("click", (evento) => {
  if (evento.target === modalExcluir) fecharModalExcluir();
});

/* Esc */
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !modalExcluir.hidden) fecharModalExcluir();
});

/* Confirmar exclusão */
btnConfirmar?.addEventListener("click", async () => {
  if (!idParaExcluir) return;

  const id = idParaExcluir;
  btnConfirmar.disabled = true;
  btnCancelar.disabled = true;
  const htmlOriginal = btnConfirmar.innerHTML;
  btnConfirmar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo…';

  try {
    const resposta = await fetchExcluirTrabalhoVoluntario(id);

    if (resposta.erro) {
      fecharModalExcluir();
      mostrarAviso(resposta.erro, null, "Erro");
      return;
    }

    /* Remove da lista local + DOM */
    servicos = servicos.filter((s) => s.id !== id);
    lista.querySelector(`[data-id="${id}"]`)?.remove();

    fecharModalExcluir();
    aplicarFiltros();
    mostrarToast("Serviço excluído com sucesso.", "sucesso");
  } catch (err) {
    console.error("Erro ao excluir:", err);
    fecharModalExcluir();
    mostrarAviso("Não foi possível excluir o serviço.", null, "Erro");
  } finally {
    btnConfirmar.disabled = false;
    btnCancelar.disabled = false;
    btnConfirmar.innerHTML = htmlOriginal;
  }
});

/* ===== CARREGAR ===== */
async function carregarServicos() {
  if (!lista) return;

  try {
    lista.innerHTML = `
      <p class="estado-carregando">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Carregando serviços…
      </p>
    `;

    const dados = await fetchCapturarTrabalhosVoluntarios();

    if (dados.erro) {
      lista.innerHTML = `
        <p class="sem-resultado">
          <i class="fa-solid fa-triangle-exclamation" style="display:block;font-size:22px;color:#8f2c1c;margin-bottom:10px"></i>
          ${escapeHtml(dados.erro)}
        </p>
      `;
      if (contador) contador.textContent = "";
      return;
    }

    servicos = (Array.isArray(dados) ? dados : [])
      .filter((s) => s && s.id != null)
      .sort((a, b) =>
        String(a.data_inicio || "").localeCompare(String(b.data_inicio || "")),
      );

    aplicarFiltros();
  } catch (err) {
    console.error("Erro ao carregar serviços:", err);
    lista.innerHTML = `
      <p class="sem-resultado">
        <i class="fa-solid fa-triangle-exclamation" style="display:block;font-size:22px;color:#8f2c1c;margin-bottom:10px"></i>
        Não foi possível carregar os serviços.
      </p>
    `;
  }
}

carregarServicos();
