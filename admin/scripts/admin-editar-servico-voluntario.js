// scripts/admin-editar-servico-voluntario.js

import { mostrarAviso } from "./components/modal.js";
import { fetchEditarTrabalhoVoluntario } from "./requisicao/fetchEditarTrabalhoVoluntario.js";

import url from "../../ambiente.js";

const API_URL = url;

/* ===== ELEMENTOS ===== */
const form = document.getElementById("formServico");
const servicoIdBadge = document.getElementById("servicoIdBadge");
const servicoInfo = document.getElementById("servicoInfo");
const botaoSalvar = document.getElementById("botaoSalvar");
const mensagemForm = document.getElementById("mensagemForm");

const campoTitulo = document.getElementById("titulo");
const campoLocal = document.getElementById("local");
const campoData = document.getElementById("data_inicio");
const campoJornada = document.getElementById("jornada");
const campoStatus = document.getElementById("status");
const campoDescricao = document.getElementById("descricao");
const contadorDescricao = document.getElementById("contadorDescricao");

/* ===== ESTADO ===== */
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

let enviando = false;

/* ===== HELPERS ===== */

function mostrarMensagem(texto, tipo = "info") {
  if (!mensagemForm) return;
  mensagemForm.textContent = texto;
  if (texto) mensagemForm.dataset.tipo = tipo;
  else delete mensagemForm.dataset.tipo;
}

/**
 * Converte ISO ("2025-02-17T03:00:00.000Z") → "2025-02-17" (para <input type="date">).
 * Usa slice(0,10) porque o backend armazena 03:00 UTC = meia-noite no Brasil,
 * então a data UTC corresponde à data local brasileira.
 */
function isoParaInputDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

/** Formata "2025-02-17T03:00:00.000Z" → "17 de fevereiro de 2025" */
function formatarData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

/** Mensagem da linha abaixo do título */
function labelStatus(status) {
  return status === "ENCERRADA" ? "Encerrada" : "Aberta";
}

/* ===== CONTADOR DE DESCRIÇÃO ===== */
campoDescricao.addEventListener("input", () => {
  contadorDescricao.textContent = campoDescricao.value.length;
});

/* ===== CARREGAR SERVIÇO ===== */
async function buscarServico(servicoId) {
  const urls = [
    `${API_URL}/trabalho-voluntario/${servicoId}`,
    `${API_URL}/trabalho-voluntario/buscar?campo=id&valor=${servicoId}`,
    `${API_URL}/servico-voluntario/${servicoId}`,
  ];

  for (const u of urls) {
    try {
      const resposta = await fetch(u);
      if (!resposta.ok) continue;

      const dados = await resposta.json();
      const item = Array.isArray(dados) ? dados[0] : dados;

      if (item && Number(item.id) === servicoId) return item;
    } catch {
      continue;
    }
  }
  return null;
}

async function carregarServico() {
  if (!id || Number.isNaN(id)) {
    mostrarAviso(
      "ID do serviço não informado na URL.",
      "./servicos-voluntarios.html",
      "Erro",
    );
    return;
  }

  try {
    const servico = await buscarServico(id);

    if (!servico) {
      mostrarAviso(
        "Serviço voluntário não encontrado.",
        "./servicos-voluntarios.html",
        "Erro",
      );
      return;
    }

    preencherFormulario(servico);
  } catch (erro) {
    console.error("Erro ao carregar serviço:", erro);
    mostrarAviso(
      "Não foi possível carregar os dados do serviço.",
      "./servicos-voluntarios.html",
      "Erro",
    );
  }
}

function preencherFormulario(servico) {
  servicoIdBadge.textContent = `#${servico.id}`;

  const dataInicio = formatarData(servico.data_inicio);
  servicoInfo.textContent = `Vaga ${labelStatus(servico.status)} · Início em ${dataInicio}`;

  campoTitulo.value = servico.titulo || "";
  campoLocal.value = servico.local || "";
  campoJornada.value = servico.jornada || "";
  campoDescricao.value = servico.descricao || "";
  campoData.value = isoParaInputDate(servico.data_inicio);

  // Status: ABERTA | ENCERRADA (fallback seguro para ABERTA)
  const statusNormalizado = String(servico.status || "").toUpperCase();
  campoStatus.value =
    statusNormalizado === "ENCERRADA" ? "ENCERRADA" : "ABERTA";

  contadorDescricao.textContent = campoDescricao.value.length;

  form.setAttribute("aria-busy", "false");
}

/* ===== VALIDAÇÕES ===== */
function validarFormulario() {
  if (!campoTitulo.value.trim()) return "O título é obrigatório.";
  if (!campoLocal.value.trim()) return "O local é obrigatório.";
  if (!campoData.value) return "A data de início é obrigatória.";
  if (!campoJornada.value.trim()) return "A jornada é obrigatória.";
  if (!campoDescricao.value.trim()) return "A descrição é obrigatória.";
  if (!["ABERTA", "ENCERRADA"].includes(campoStatus.value))
    return "Status inválido.";
  return null;
}

/* ===== SUBMIT ===== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (enviando) return;

  const erro = validarFormulario();
  if (erro) {
    mostrarMensagem(erro, "erro");
    return;
  }

  enviando = true;
  botaoSalvar.disabled = true;
  const htmlOriginal = botaoSalvar.innerHTML;
  botaoSalvar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Salvando…';
  mostrarMensagem("");

  try {
    const dados = {
      titulo: campoTitulo.value.trim(),
      local: campoLocal.value.trim(),
      data_inicio: campoData.value, // YYYY-MM-DD
      jornada: campoJornada.value.trim(),
      descricao: campoDescricao.value.trim(),
      status: campoStatus.value, // ABERTA | ENCERRADA
    };

    const resposta = await fetchEditarTrabalhoVoluntario(id, dados);

    if (resposta?.erro) {
      mostrarMensagem(resposta.erro, "erro");
      mostrarAviso(resposta.erro, null, "Erro");
      return;
    }

    mostrarAviso(
      "Serviço voluntário atualizado com sucesso!",
      "./servicos-voluntarios.html",
      "Sucesso",
    );
  } catch (err) {
    console.error("Erro ao salvar:", err);
    const msg = "Não foi possível salvar as alterações.";
    mostrarMensagem(msg, "erro");
    mostrarAviso(msg, null, "Erro");
  } finally {
    enviando = false;
    botaoSalvar.disabled = false;
    botaoSalvar.innerHTML = htmlOriginal;
  }
});

/* ===== INIT ===== */
carregarServico();
