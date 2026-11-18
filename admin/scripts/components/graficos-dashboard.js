// ./admin/scripts/components/graficos-dashboard.js
// Depende de window.Chart (Chart.js via CDN no <head> do HTML)

import { fetchCapturarPets } from "../requisicao/fetchCapturarPets.js";
import { fetchCapturarSolicitacoes } from "../requisicao/fetchCapturarSolicitacoes.js";
import { fetchCapturarTrabalhosVoluntarios } from "../requisicao/fetchCapturarTrabalhosVoluntarios.js";
import { fetchCapturarInscricoesVoluntariado } from "../requisicao/fetchCapturarInscricoesVoluntariado.js";

/* =========================================================
   PALETA E PADRÕES
   ========================================================= */

const cores = {
  vinho: "#702c38",
  vinhoClaro: "#a45c68",
  bege: "#d8b99d",
  begeClaro: "#ead9c8",
  marrom: "#987e69",
};

Chart.defaults.font.family = "DM Sans";
Chart.defaults.color = cores.marrom;

/* =========================================================
   HELPERS
   ========================================================= */

/** Normaliza resposta da API — aceita array direto ou {chave: [...]} */
function extrairLista(resultado, chave = "pets") {
  if (!resultado || resultado.erro) return [];
  if (Array.isArray(resultado)) return resultado;
  return resultado[chave] || [];
}

/** "Nov", "Dez"... a partir de um Date */
function nomeMesCurto(date) {
  return date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Nome completo do mês ("Novembro") */
function nomeMesCompleto(date) {
  return date
    .toLocaleDateString("pt-BR", { month: "long" })
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Verifica se uma data ISO pertence a um dado ano/mês (timezone local).
 */
function pertenceAoMes(iso, ano, mes) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === ano && d.getMonth() === mes;
}

/* =========================================================
   1) SITUAÇÃO DOS ANIMAIS  (doughnut) — DINÂMICO
   ========================================================= */

async function iniciarGraficoSituacao() {
  const canvas = document.getElementById("graficoPets");
  if (!canvas) return;

  const resultado = await fetchCapturarPets();
  const pets = extrairLista(resultado);

  const conta = { ADOTADO: 0, DISPONIVEL: 0, EM_PROCESSO: 0 };

  pets.forEach((p) => {
    const s = (p.status || "").toUpperCase();
    if (s in conta) conta[s]++;
  });

  new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Adotados", "Disponíveis", "Em processo"],
      datasets: [
        {
          data: [conta.ADOTADO, conta.DISPONIVEL, conta.EM_PROCESSO],
          backgroundColor: [cores.vinho, cores.bege, cores.vinhoClaro],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 18 },
        },
      },
    },
  });
}

iniciarGraficoSituacao();

/* =========================================================
   2) ADOÇÕES APROVADAS POR MÊS  (bar) — DINÂMICO
   Conta solicitações com status APROVADA agrupadas pelo
   mês de data_solicitacao (últimos 8 meses).
   ========================================================= */

async function iniciarGraficoAdocoes() {
  const canvas = document.getElementById("graficoAdocoes");
  if (!canvas) return;

  const resultado = await fetchCapturarSolicitacoes();
  const solicitacoes = extrairLista(resultado, "solicitacoes");

  // Monta os últimos 8 meses (do mais antigo pro atual)
  const agora = new Date();
  const meses = [];

  for (let i = 7; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    meses.push({
      label: nomeMesCurto(d),
      ano: d.getFullYear(),
      mes: d.getMonth(),
      total: 0,
    });
  }

  // Conta as APROVADAS por mês de data_solicitacao
  solicitacoes
    .filter(
      (s) =>
        (s.status || "").toUpperCase() === "APROVADA" && s.data_solicitacao,
    )
    .forEach((s) => {
      const d = new Date(s.data_solicitacao);
      if (Number.isNaN(d.getTime())) return;

      const slot = meses.find(
        (m) => m.ano === d.getFullYear() && m.mes === d.getMonth(),
      );
      if (slot) slot.total++;
    });

  const totais = meses.map((m) => m.total);

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: meses.map((m) => m.label),
      datasets: [
        {
          label: "Adoções aprovadas",
          data: totais,
          backgroundColor: meses.map((m) =>
            m.total > 0 ? cores.vinhoClaro : cores.begeClaro,
          ),
          borderRadius: 8,
          maxBarThickness: 35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const n = ctx.parsed.y;
              return `${n} ${n === 1 ? "adoção" : "adoções"}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
        },
      },
    },
  });
}

iniciarGraficoAdocoes();

/* =========================================================
   3) CACHORROS × GATOS DISPONÍVEIS  (bar) — DINÂMICO
   ========================================================= */

async function iniciarGraficoEspecies() {
  const canvas = document.getElementById("graficoEspecies");
  if (!canvas) return;

  const resultado = await fetchCapturarPets();
  const pets = extrairLista(resultado);

  const disponiveis = pets.filter(
    (p) => (p.status || "").toUpperCase() === "DISPONIVEL",
  );

  let cachorros = 0;
  let gatos = 0;

  disponiveis.forEach((p) => {
    const esp = (p.especie || "").toUpperCase();
    if (esp === "CACHORRO") cachorros++;
    else if (esp === "GATO") gatos++;
  });

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Cachorros", "Gatos"],
      datasets: [
        {
          label: "Disponíveis para adoção",
          data: [cachorros, gatos],
          backgroundColor: [cores.vinho, cores.bege],
          borderRadius: 8,
          maxBarThickness: 60,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
        },
      },
    },
  });
}

iniciarGraficoEspecies();

/* =========================================================
   4) REGISTROS DO MÊS ATUAL  (bar horizontal) — DINÂMICO
   Compara quantos pets, solicitações, oportunidades e
   inscrições entraram NO MÊS CORRENTE (não histórico total).
   ========================================================= */

async function iniciarGraficoAtividades() {
  const canvas = document.getElementById("graficoAtividades");
  if (!canvas) return;

  const [resPets, resSolicitacoes, resTrabalhos, resInscricoes] =
    await Promise.all([
      fetchCapturarPets(),
      fetchCapturarSolicitacoes(),
      fetchCapturarTrabalhosVoluntarios(),
      fetchCapturarInscricoesVoluntariado(),
    ]);

  const pets = extrairLista(resPets);
  const solicitacoes = extrairLista(resSolicitacoes, "solicitacoes");
  const trabalhos = extrairLista(resTrabalhos, "oportunidades");
  const inscricoes = extrairLista(resInscricoes, "inscricoes");

  // ─── Mês corrente ─────────────────────────────────────
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth();

  // ─── Filtra cada lista pelo mês atual ─────────────────
  const petsDoMes = pets.filter((p) =>
    pertenceAoMes(p.data_cadastro, anoAtual, mesAtual),
  ).length;

  const solicitacoesDoMes = solicitacoes.filter((s) =>
    pertenceAoMes(s.data_solicitacao, anoAtual, mesAtual),
  ).length;

  const trabalhosDoMes = trabalhos.filter((t) =>
    pertenceAoMes(t.data_cadastro, anoAtual, mesAtual),
  ).length;

  const inscricoesDoMes = inscricoes.filter((i) =>
    pertenceAoMes(i.data_inscricao, anoAtual, mesAtual),
  ).length;

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: [
        "Pets cadastrados",
        "Solicitações de adoção",
        "Oportunidades de voluntariado",
        "Inscrições em voluntariado",
      ],
      datasets: [
        {
          label: `Registros em ${nomeMesCompleto(agora)}`,
          data: [petsDoMes, solicitacoesDoMes, trabalhosDoMes, inscricoesDoMes],
          backgroundColor: [
            cores.vinho,
            cores.vinhoClaro,
            cores.bege,
            cores.marrom,
          ],
          borderRadius: 8,
          maxBarThickness: 38,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y", // 👈 barras horizontais
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const n = ctx.parsed.x;
              return `${n} ${n === 1 ? "registro" : "registros"}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
        },
        y: {
          ticks: {
            font: { size: 12 },
          },
        },
      },
    },
  });
}

iniciarGraficoAtividades();
