// ./admin/scripts/components/graficos-dashboard.js
// Depende de window.Chart (Chart.js via CDN no <head> do HTML)

import { fetchCapturarPets } from "../requisicao/fetchCapturarPets.js";

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
   HELPER — normaliza a resposta da API
   (pode vir como array direto OU { pets: [...] })
   ========================================================= */
function extrairPets(resultado) {
  if (!resultado || resultado.erro) return [];
  return Array.isArray(resultado) ? resultado : resultado.pets || [];
}

/* =========================================================
   1) SITUAÇÃO DOS ANIMAIS  (doughnut) — DINÂMICO
   ========================================================= */

async function iniciarGraficoSituacao() {
  const canvas = document.getElementById("graficoPets");
  if (!canvas) return;

  const resultado = await fetchCapturarPets();
  const pets = extrairPets(resultado);

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
   2) ADOÇÕES POR MÊS  (bar) — MOCK
   Não há "data_adocao" no banco. Quando o backend adicionar,
   troque o `data` do dataset por contagem real abaixo.
   ========================================================= */

new Chart(document.getElementById("graficoAdocoes"), {
  type: "bar",
  data: {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"],
    datasets: [
      {
        label: "Adoções",
        data: [2, 3, 4, 2, 5, 4, 3, 4],
        backgroundColor: [
          cores.bege,
          cores.vinhoClaro,
          cores.vinhoClaro,
          cores.bege,
          cores.vinho,
          cores.vinhoClaro,
          cores.vinhoClaro,
          cores.vinhoClaro,
        ],
        borderRadius: 8,
        maxBarThickness: 35,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  },
});

/* =========================================================
   3) CACHORROS × GATOS DISPONÍVEIS  (bar) — DINÂMICO
   ========================================================= */

async function iniciarGraficoEspecies() {
  const canvas = document.getElementById("graficoEspecies");
  if (!canvas) return;

  const resultado = await fetchCapturarPets();
  const pets = extrairPets(resultado);

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
   4) ATIVIDADES DA ONG  (radar) — MOCK
   Precisa de endpoints separados (voluntários, doações,
   cadastros, acompanhamentos). Sem eles, fica mockado.
   ========================================================= */

new Chart(document.getElementById("graficoAtividades"), {
  type: "radar",
  data: {
    labels: [
      "Adoções",
      "Voluntários",
      "Doações",
      "Cadastros",
      "Acompanhamentos",
    ],
    datasets: [
      {
        label: "Atividades registradas",
        data: [27, 14, 22, 30, 18],
        borderColor: cores.vinho,
        backgroundColor: "rgba(112, 44, 56, 0.18)",
        pointBackgroundColor: cores.vinho,
        pointRadius: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        ticks: { stepSize: 10 },
        grid: { color: "#eadfd4" },
        angleLines: { color: "#eadfd4" },
        pointLabels: { color: "#806b5d" },
      },
    },
  },
});
