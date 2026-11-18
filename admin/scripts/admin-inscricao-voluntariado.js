// ./admin/scripts/admin-inscricao-voluntariado.js

import { fetchCapturarInscricaoVoluntariado } from "./requisicao/fetchCapturarInscricaoVoluntariado.js";
import { fetchEditarStatusInscricao } from "./requisicao/fetchEditarStatusInscricao.js";
import { fetchCapturarTrabalhosVoluntarios } from "./requisicao/fetchCapturarTrabalhosVoluntarios.js";

/* =========================================================
   ELEMENTOS
   ========================================================= */
const inscricaoIdEl = document.getElementById("inscricaoId");
const statusBadgeEl = document.getElementById("statusBadge");
const infoDataEl = document.getElementById("infoData");
const conteudoCarregado = document.getElementById("conteudoCarregado");
const estadoErro = document.getElementById("estadoErro");
const estadoErroTexto = document.getElementById("estadoErroTexto");

// Candidato
const candNome = document.getElementById("candNome");
const candIdade = document.getElementById("candIdade");
const candProfissao = document.getElementById("candProfissao");
const candEmail = document.getElementById("candEmail");
const candTelefone = document.getElementById("candTelefone");
const candEndereco = document.getElementById("candEndereco");
const candDias = document.getElementById("candDias");
const candPeriodos = document.getElementById("candPeriodos");
const candJornada = document.getElementById("candJornada");
const candExpVoluntario = document.getElementById("candExpVoluntario");
const candHabilidades = document.getElementById("candHabilidades");
const candExpAnimais = document.getElementById("candExpAnimais");
const candCiente = document.getElementById("candCiente");
const candConcorda = document.getElementById("candConcorda");
const candMotivacao = document.getElementById("candMotivacao");

// Oportunidade
const opTitulo = document.getElementById("opTitulo");
const opStatusBadge = document.getElementById("opStatusBadge");
const opDescricao = document.getElementById("opDescricao");
const opLocal = document.getElementById("opLocal");
const opJornada = document.getElementById("opJornada");
const opDataInicio = document.getElementById("opDataInicio");

// Modal de confirmação
const modalConfirmar = document.getElementById("modalConfirmar");
const modalIcone = document.getElementById("modalIcone");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const modalCancelar = document.getElementById("modalCancelar");
const modalConfirmarBtn = document.getElementById("modalConfirmarBtn");

// Toast
const toastEl = document.getElementById("toast");

/* =========================================================
   ESTADO
   ========================================================= */
const params = new URLSearchParams(location.search);
const inscricaoId = Number(params.get("id"));

let inscricao = null;
let oportunidade = null;
let acaoEmAndamento = false;
let acaoPendente = null;

/* =========================================================
   HELPERS
   ========================================================= */

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

function formatarTelefone(tel) {
  if (!tel) return "—";
  const d = String(tel).replace(/\D/g, "");
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel;
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

function badgeSimNao(valor, el) {
  const sim = Number(valor) === 1 || valor === true || valor === "1";
  el.textContent = sim ? "Sim" : "Não";
  el.className = `badge-sim-nao ${sim ? "sim" : "nao"}`;
}

function renderizarChips(el, texto) {
  el.innerHTML = "";
  if (!texto || !texto.trim()) {
    const span = document.createElement("span");
    span.className = "chip vazio";
    span.textContent = "Não informado";
    el.appendChild(span);
    return;
  }
  texto
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = item;
      el.appendChild(chip);
    });
}

function normalizarNumeroWhatsapp(tel) {
  const d = String(tel || "").replace(/\D/g, "");
  if (d.length === 10) return d.slice(0, 2) + "9" + d.slice(2);
  return d;
}

/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */

function renderizar() {
  // Cabeçalho
  inscricaoIdEl.textContent = `#${inscricao.id}`;
  statusBadgeEl.textContent = labelStatus(inscricao.status);
  statusBadgeEl.className = `badge-status ${classeStatus(inscricao.status)}`;

  infoDataEl.textContent = `Recebida em ${formatarData(inscricao.data_inscricao)}`;

  // Candidato
  candNome.textContent = inscricao.nome_completo || "—";
  candIdade.textContent = inscricao.idade ? `${inscricao.idade} anos` : "—";
  candProfissao.textContent = inscricao.profissao_atual || "—";
  candEndereco.textContent = inscricao.endereco_residencial || "—";

  if (inscricao.email) {
    candEmail.textContent = inscricao.email;
    candEmail.href = `mailto:${inscricao.email}`;
  } else {
    candEmail.textContent = "—";
    candEmail.removeAttribute("href");
  }

  if (inscricao.telefone_contato) {
    candTelefone.textContent = formatarTelefone(inscricao.telefone_contato);
    candTelefone.href = `tel:${String(inscricao.telefone_contato).replace(/\D/g, "")}`;
  } else {
    candTelefone.textContent = "—";
    candTelefone.removeAttribute("href");
  }

  renderizarChips(candDias, inscricao.dias_disponiveis);
  renderizarChips(candPeriodos, inscricao.periodos_disponiveis);
  badgeSimNao(inscricao.disponibilidade_durante_jornada, candJornada);

  candExpVoluntario.textContent =
    inscricao.experiencias_anteriores_trabalho_voluntario || "—";
  candHabilidades.textContent = inscricao.possui_habilidade_relevante || "—";
  candExpAnimais.textContent = inscricao.possui_experiencia_animais || "—";

  badgeSimNao(inscricao.ciente_atividades_responsabilidades, candCiente);
  badgeSimNao(inscricao.concorda_orientacoes_regras_seguranca, candConcorda);
  candMotivacao.textContent = inscricao.motivacao_interesse || "—";

  // Oportunidade
  if (oportunidade) {
    opTitulo.textContent =
      oportunidade.titulo ||
      `Oportunidade #${inscricao.id_oportunidade_voluntario}`;
    opDescricao.textContent = oportunidade.descricao || "Sem descrição.";
    opLocal.textContent = oportunidade.local || "—";
    opJornada.textContent = oportunidade.jornada || "—";
    opDataInicio.textContent = oportunidade.data_inicio
      ? `Início em ${formatarData(oportunidade.data_inicio)}`
      : "Data não definida";

    const statusOp = (oportunidade.status || "").toUpperCase();
    const aberta = statusOp === "ABERTA";
    opStatusBadge.textContent = aberta ? "Aberta" : "Encerrada";
    opStatusBadge.className = `badge-oportunidade ${aberta ? "aberta" : "encerrada"}`;
  } else {
    opTitulo.textContent = `Oportunidade #${inscricao.id_oportunidade_voluntario}`;
    opDescricao.textContent =
      "Não foi possível carregar os dados da oportunidade.";
    opLocal.textContent = "—";
    opJornada.textContent = "—";
    opDataInicio.textContent = "—";
    opStatusBadge.textContent = "—";
    opStatusBadge.className = "badge-oportunidade encerrada";
  }

  // Botões: só desabilita ações finais (APROVADA, REPROVADA).
  // "Entrar em contato" (EM_ANALISE) é repetível.
  document.querySelectorAll(".botao-acao").forEach((btn) => {
    const acao = btn.dataset.acao;
    const ehAcaoFinal = acao === "APROVADA" || acao === "REPROVADA";
    const ehStatusAtual = acao === inscricao.status;

    if (ehAcaoFinal && ehStatusAtual) {
      btn.classList.add("atual");
      btn.disabled = true;
    } else {
      btn.classList.remove("atual");
      btn.disabled = false;
    }
  });

  // Mostra conteúdo
  conteudoCarregado.hidden = false;
}

/* =========================================================
   CARREGAMENTO
   ========================================================= */

async function carregarTudo() {
  // Garante estado inicial limpo (CSS pode não respeitar `hidden` puro)
  estadoErro.hidden = true;

  if (!inscricaoId || Number.isNaN(inscricaoId)) {
    estadoErroTexto.textContent = "ID da inscrição inválido na URL.";
    estadoErro.hidden = false;
    infoDataEl.textContent = "";
    return;
  }

  const [resInscricao, resOportunidades] = await Promise.all([
    fetchCapturarInscricaoVoluntariado(inscricaoId),
    fetchCapturarTrabalhosVoluntarios(),
  ]);

  if (resInscricao?.erro) {
    estadoErroTexto.textContent = resInscricao.erro;
    estadoErro.hidden = false;
    infoDataEl.textContent = "";
    return;
  }

  inscricao = resInscricao;

  const oportunidades = Array.isArray(resOportunidades)
    ? resOportunidades
    : resOportunidades?.oportunidades || [];

  oportunidade =
    oportunidades.find((o) => o.id === inscricao.id_oportunidade_voluntario) ||
    null;

  renderizar();

  // Esconde explicitamente após renderizar (dupla garantia)
  estadoErro.hidden = true;
}

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
   MODAL DE CONFIRMAÇÃO
   ========================================================= */

function pedirConfirmacao({ titulo, texto, icone, cor, onConfirm }) {
  modalTitulo.textContent = titulo;
  modalTexto.textContent = texto;

  modalIcone.className = `modal-icone ${cor || ""}`;
  modalIcone.innerHTML = `<i class="fa-solid ${icone || "fa-circle-question"}"></i>`;

  acaoPendente = onConfirm;
  modalConfirmar.hidden = false;
}

function fecharModal() {
  modalConfirmar.hidden = true;
  acaoPendente = null;
}

modalCancelar?.addEventListener("click", fecharModal);

modalConfirmar?.addEventListener("click", (e) => {
  if (e.target === modalConfirmar) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalConfirmar.hidden) fecharModal();
});

modalConfirmarBtn?.addEventListener("click", () => {
  const fn = acaoPendente;
  fecharModal();
  if (fn) fn();
});

/* =========================================================
   EXECUÇÃO DAS AÇÕES
   ========================================================= */

function desabilitarBotoes(desabilitar) {
  document.querySelectorAll(".botao-acao").forEach((btn) => {
    btn.disabled = desabilitar;
  });
}

async function executarAcao(status) {
  if (acaoEmAndamento) return;
  acaoEmAndamento = true;
  desabilitarBotoes(true);

  const resultado = await fetchEditarStatusInscricao(inscricaoId, status);

  if (resultado.erro) {
    mostrarToast(resultado.erro, "falha");
    desabilitarBotoes(false);
    acaoEmAndamento = false;
    return;
  }

  mostrarToast(`Status atualizado para "${labelStatus(status)}".`, "sucesso");

  // Entrar em contato: abre WhatsApp em nova aba
  if (status === "EM_ANALISE") {
    const numero = normalizarNumeroWhatsapp(inscricao.telefone_contato);

    if (numero.length === 11) {
      const whatsappUrl = `https://wa.me/55${numero}`;

      // Usa <a> simulado — evita o problema do window.open com noopener
      // (que retorna null por design e caía no fallback indesejado)
      const link = document.createElement("a");
      link.href = whatsappUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Volta pra lista depois do toast
      setTimeout(() => {
        window.location.href = "./inscricoes-voluntariado.html";
      }, 900);
      return;
    }

    // Telefone inválido para WhatsApp — só avisa e volta
    mostrarToast(
      "Status atualizado, mas o telefone não é válido para WhatsApp.",
      "falha",
    );
  }

  // Demais ações (APROVADA, REPROVADA): só volta pra lista
  setTimeout(() => {
    window.location.href = "./inscricoes-voluntariado.html";
  }, 900);
}

/* =========================================================
   EVENTOS DOS BOTÕES
   ========================================================= */

document.querySelectorAll(".botao-acao").forEach((btn) => {
  btn.addEventListener("click", () => {
    const status = btn.dataset.acao;
    const nome = inscricao?.nome_completo || "este candidato";

    if (status === "REPROVADA") {
      pedirConfirmacao({
        titulo: "Recusar inscrição?",
        texto: `A inscrição de ${nome} será marcada como reprovada. Essa ação pode ser revertida depois.`,
        icone: "fa-xmark",
        cor: "perigo",
        onConfirm: () => executarAcao("REPROVADA"),
      });
    } else if (status === "EM_ANALISE") {
      pedirConfirmacao({
        titulo: "Entrar em contato?",
        texto: `A inscrição será marcada como "em análise" e o WhatsApp de ${nome} será aberto em uma nova aba.`,
        icone: "fa-comment-dots",
        cor: "contato",
        onConfirm: () => executarAcao("EM_ANALISE"),
      });
    } else if (status === "APROVADA") {
      pedirConfirmacao({
        titulo: "Aprovar inscrição?",
        texto: `A inscrição de ${nome} será aprovada. Essa ação pode ser revertida depois.`,
        icone: "fa-check",
        cor: "sucesso",
        onConfirm: () => executarAcao("APROVADA"),
      });
    }
  });
});

/* =========================================================
   INIT
   ========================================================= */

carregarTudo();
