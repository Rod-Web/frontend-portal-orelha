// scripts/admin-cadastrar-servico-voluntario.js

import { mostrarAviso } from "./components/modal.js";
import { fetchCadastrarTrabalhoVoluntario } from "./requisicao/fetchCadastrarTrabalhoVoluntario.js";

/* ===== ELEMENTOS ===== */
const form = document.getElementById("formServico");
const botaoSalvar = document.getElementById("botaoSalvar");
const mensagemForm = document.getElementById("mensagemForm");

const campoTitulo = document.getElementById("titulo");
const campoLocal = document.getElementById("local");
const campoData = document.getElementById("data_inicio");
const campoJornada = document.getElementById("jornada");
const campoDescricao = document.getElementById("descricao");
const contadorDescricao = document.getElementById("contadorDescricao");

/* ===== ESTADO ===== */
let enviando = false;

/* ===== HELPERS ===== */
function mostrarMensagem(texto, tipo = "info") {
  if (!mensagemForm) return;
  mensagemForm.textContent = texto;
  if (texto) mensagemForm.dataset.tipo = tipo;
  else delete mensagemForm.dataset.tipo;
}

function validarFormulario() {
  if (!campoTitulo.value.trim()) return "O título é obrigatório.";
  if (!campoLocal.value.trim()) return "O local é obrigatório.";
  if (!campoData.value) return "A data de início é obrigatória.";
  if (!campoJornada.value.trim()) return "A jornada é obrigatória.";
  if (!campoDescricao.value.trim()) return "A descrição é obrigatória.";
  return null;
}

/* ===== CONTADOR ===== */
campoDescricao.addEventListener("input", () => {
  contadorDescricao.textContent = campoDescricao.value.length;
});

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
    '<i class="fa-solid fa-spinner fa-spin"></i> Cadastrando…';
  mostrarMensagem("");

  try {
    const dados = {
      titulo: campoTitulo.value.trim(),
      local: campoLocal.value.trim(),
      data_inicio: campoData.value, // YYYY-MM-DD (formato do <input type="date">)
      jornada: campoJornada.value.trim(),
      descricao: campoDescricao.value.trim(),
    };

    const resposta = await fetchCadastrarTrabalhoVoluntario(dados);

    if (resposta.erro) {
      mostrarMensagem(resposta.erro, "erro");
      mostrarAviso(resposta.erro, null, "Erro");
      return;
    }

    mostrarAviso(
      "Serviço voluntário cadastrado com sucesso!",
      "./dashboard.html",
      "Sucesso",
    );
  } catch (err) {
    console.error("Erro ao cadastrar serviço voluntário:", err);
    const msg = "Não foi possível cadastrar o serviço. Tente novamente.";
    mostrarMensagem(msg, "erro");
    mostrarAviso(msg, null, "Erro");
  } finally {
    enviando = false;
    botaoSalvar.disabled = false;
    botaoSalvar.innerHTML = htmlOriginal;
  }
});
