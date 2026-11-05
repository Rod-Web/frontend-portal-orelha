// scripts/detalhes_voluntariado.js

import url from "../../ambiente.js";

const API_URL = `${url}/trabalho-voluntario`;

const container = document.getElementById("vagaContainer");

/* =========================================================
   STATUS
   ========================================================= */
const STATUS_INFO = {
  ABERTA: { texto: "Aberta", classe: "vaga-status--aberta" },
  ENCERRADA: { texto: "Encerrada", classe: "vaga-status--encerrada" },
};

/* =========================================================
   UTILIDADES
   ========================================================= */
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

function decomporData(iso) {
  if (!iso || typeof iso !== "string") {
    return { dia: "—", mes: "—", ano: "" };
  }

  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return { dia: "—", mes: "—", ano: "" };

  return {
    dia,
    mes: MESES_CURTOS[Number(mes) - 1] || "—",
    ano,
  };
}

function dataCompleta(iso) {
  if (!iso || typeof iso !== "string") return "Data não informada";

  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "Data não informada";

  const data = new Date(`${ano}-${mes}-${dia}T12:00:00`);
  if (Number.isNaN(data.getTime())) return "Data não informada";

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

/* =========================================================
   RENDER
   ========================================================= */
function renderizarVaga(vaga) {
  const status = STATUS_INFO[vaga.status] || STATUS_INFO.ABERTA;
  const { dia, mes, ano } = decomporData(vaga.data_inicio);
  const encerrada = vaga.status === "ENCERRADA";

  const acaoPrincipal = encerrada
    ? `<span class="botao botao--desabilitado">
         Vaga encerrada
       </span>`
    : `<a class="botao botao--primario" href="./form-voluntariado.html?id=${vaga.id}">
         <i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i>
         Quero me candidatar
       </a>`;

  container.innerHTML = `
        <header class="vaga-topo">
            <div class="vaga-data-bloco" aria-hidden="true">
                <span class="data-mes">${mes}</span>
                <span class="data-dia">${dia}</span>
                <span class="data-ano">${ano}</span>
            </div>

            <div class="vaga-identificacao">
                <span class="vaga-status ${status.classe}">${status.texto}</span>
                <h1 class="vaga-titulo">${escapeHtml(vaga.titulo)}</h1>
            </div>
        </header>

        <div class="vaga-corpo">
            <h2 class="vaga-secao-titulo">Sobre a vaga</h2>
            <p class="vaga-descricao">${escapeHtml(vaga.descricao || "Sem descrição.")}</p>

            <div class="vaga-info">
                <div class="info-item">
                    <span class="info-rotulo">
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                        Local
                    </span>
                    <span class="info-valor">${escapeHtml(vaga.local || "—")}</span>
                </div>

                <div class="info-item">
                    <span class="info-rotulo">
                        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                        Início
                    </span>
                    <span class="info-valor">${escapeHtml(dataCompleta(vaga.data_inicio))}</span>
                </div>

                <div class="info-item">
                    <span class="info-rotulo">
                        <i class="fa-regular fa-clock" aria-hidden="true"></i>
                        Jornada
                    </span>
                    <span class="info-valor">${escapeHtml(vaga.jornada || "—")}</span>
                </div>
            </div>

            <div class="vaga-acoes">
                ${acaoPrincipal}
                <a class="botao botao--secundario" href="./voluntariado.html">
                    Ver outras vagas
                </a>
            </div>
        </div>
    `;

  document.title = `Portal Orelha | ${vaga.titulo}`;
}

function renderizarErro(mensagem, mostrarVoltar = true) {
  container.innerHTML = `
        <div class="estado estado--erro">
            <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
            <p>${escapeHtml(mensagem)}</p>
            ${
              mostrarVoltar
                ? `<p style="margin-top:14px"><a href="./voluntariado.html">Voltar para a lista de vagas</a></p>`
                : ""
            }
        </div>
    `;
  document.title = "Portal Orelha | Vaga não encontrada";
}

/* =========================================================
   CARREGAR VAGA
   ========================================================= */
async function carregarVaga() {
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id || !/^\d+$/.test(id)) {
    renderizarErro("Nenhuma vaga foi especificada na URL.");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/${id}`);

    if (resposta.status === 404) {
      renderizarErro(`Não encontramos a vaga de id ${id}.`);
      return;
    }

    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = await resposta.json();

    /* Normaliza: array OU objeto (variação de API) */
    const vaga = Array.isArray(dados) ? dados[0] : dados;

    if (!vaga || !vaga.id) {
      renderizarErro(`Não encontramos a vaga de id ${id}.`);
      return;
    }

    renderizarVaga(vaga);
  } catch (erro) {
    console.error("Erro ao carregar vaga:", erro);
    renderizarErro(
      `Não foi possível carregar esta vaga. Verifique se a API está rodando em ${url}.`,
    );
  }
}

carregarVaga();
