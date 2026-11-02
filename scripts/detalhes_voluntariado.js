// scripts/detalhes_voluntariado.js

/* =========================================================
   DADOS (mesmo array do voluntariado.js — substituir por API depois)
   ========================================================= */
const VAGAS = [
  {
    id: 1,
    titulo: "Voluntário de passeio com cães",
    descricao:
      "Leve nossos cães para passear no parque. Atividade ao ar livre, ótima para quem gosta de caminhar e passar tempo com os animais. Você vai acompanhar de 1 a 2 cães por turno, sempre com apoio de um cuidador do abrigo.",
    local: "Abrigo Caramelo — Zona Sul",
    data_inicio: "2025-02-10",
    jornada_trabalho: "Sábados, 9h às 12h",
    status: "ABERTA",
  },
  {
    id: 2,
    titulo: "Cuidador de gatos (manhã)",
    descricao:
      "Alimentação, limpeza dos espaços e socialização dos gatos resgatados. Trabalho tranquilo, ideal para quem tem paciência e carinho com felinos. Necessário amor por gatos e disponibilidade mínima de 3 horas por turno.",
    local: "Abrigo Caramelo — Centro",
    data_inicio: "2025-02-03",
    jornada_trabalho: "Seg a sex, 8h às 11h",
    status: "ENCERRADA",
  },
  {
    id: 3,
    titulo: "Fotógrafo de pets para adoção",
    descricao:
      "Registre fotos que ajudam os pets a encontrar um lar. Você pode usar seu próprio equipamento (câmera ou celular) e trabalhar em horários flexíveis. As fotos serão usadas no site, redes sociais e feiras de adoção.",
    local: "Remoto + visitas ao abrigo",
    data_inicio: "2025-03-01",
    jornada_trabalho: "2h por semana (flexível)",
    status: "ABERTA",
  },
  {
    id: 4,
    titulo: "Transporte de animais para consultas",
    descricao:
      "Levar pets a consultas veterinárias parceiras. Necessário ter carro e disponibilidade em dias de semana. As despesas de combustível são reembolsadas pelo abrigo.",
    local:
      "Do abrigo Caramelo no Centro até a Clínica Animais do Bem, Jardim Belém",
    data_inicio: "2025-02-17",
    jornada_trabalho: "Sob demanda",
    status: "ABERTA",
  },
  {
    id: 5,
    titulo: "Apoio em feiras de adoção",
    descricao:
      "Receber o público, orientar sobre adoção responsável e ajudar na organização do espaço. Trabalho em equipe, com muito contato com pessoas e animais. Ideal para quem é comunicativo e organizado.",
    local: "Praça Central",
    data_inicio: "2025-04-05",
    jornada_trabalho: "1º sábado do mês, 10h às 16h",
    status: "ABERTA",
  },
  {
    id: 6,
    titulo: "Auxiliar administrativo",
    descricao:
      "Cadastro de doadores e organização de doações. Trabalho interno, sem contato direto com animais. Necessário conhecimento básico de planilhas.",
    local: "Abrigo Caramelo — Centro",
    data_inicio: "2025-01-20",
    jornada_trabalho: "Ter e qui, 14h às 17h",
    status: "ENCERRADA",
  },
];

/* =========================================================
   ELEMENTOS
   ========================================================= */
const container = document.getElementById("vaga");

/* =========================================================
   UTILIDADES
   ========================================================= */
const STATUS_INFO = {
  ABERTA: { texto: "Aberta", classe: "vaga-status--aberta" },
  URGENTE: { texto: "Urgente", classe: "vaga-status--urgente" },
  ENCERRADA: { texto: "Encerrada", classe: "vaga-status--encerrada" },
};

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
  if (!iso) return { dia: "—", mes: "—", ano: "" };

  const data = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(data.getTime())) return { dia: "—", mes: "—", ano: "" };

  return {
    dia: String(data.getDate()).padStart(2, "0"),
    mes: MESES_CURTOS[data.getMonth()] || "—",
    ano: String(data.getFullYear()),
  };
}

function dataCompleta(iso) {
  if (!iso) return "Data não informada";
  const data = new Date(`${iso}T00:00:00`);
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
  const status = STATUS_INFO[vaga.status] || STATUS_INFO.ENCERRADA;
  const { dia, mes, ano } = decomporData(vaga.data_inicio);

  const encerrada = vaga.status === "ENCERRADA";

  const acaoPrincipal = encerrada
    ? `<span class="botao secundario"
             aria-disabled="true"
             style="cursor: not-allowed; opacity: .6;">
           Vaga encerrada
       </span>`
    : `<a class="botao candidatar" href="./form-voluntariado.html?id=${vaga.id}">
           <i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i>
           Quero me candidatar
       </a>`;

  container.innerHTML = `
        <header class="vaga-topo">
            <div class="vaga-data" aria-hidden="true">
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
            <p class="vaga-descricao">${escapeHtml(vaga.descricao)}</p>

            <div class="vaga-info">
                <div class="info-item">
                    <span class="info-rotulo">
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                        Local
                    </span>
                    <span class="info-valor">${escapeHtml(vaga.local)}</span>
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
                    <span class="info-valor">${escapeHtml(vaga.jornada_trabalho)}</span>
                </div>
            </div>

            <div class="vaga-acoes">
                ${acaoPrincipal}
                <a class="botao secundario" href="./voluntariado.html">
                    Ver outras vagas
                </a>
            </div>
        </div>
    `;

  document.title = `Portal Orelha | ${vaga.titulo}`;
}

function renderizarErro(motivo) {
  container.innerHTML = `
        <p class="mensagem">
            ${escapeHtml(motivo)}<br>
            <a href="./voluntariado.html">Voltar para a lista de vagas</a>
        </p>
    `;
  document.title = "Portal Orelha | Vaga não encontrada";
}

/* =========================================================
   CARREGAR VAGA
   ========================================================= */
function carregarVaga() {
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id || Number.isNaN(id)) {
    renderizarErro("Nenhuma vaga foi especificada na URL.");
    return;
  }

  const vaga = VAGAS.find((v) => v.id === id);

  if (!vaga) {
    renderizarErro(`Não encontramos a vaga de id ${id}.`);
    return;
  }

  renderizarVaga(vaga);
}

carregarVaga();
