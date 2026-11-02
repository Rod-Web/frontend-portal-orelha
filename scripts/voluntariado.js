// voluntariado.js — independente, dados estáticos

/* =========================================================
   DADOS (substituir por fetch quando houver API)
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
const corpo = document.getElementById("corpoVoluntariado");
const contadorVagas = document.getElementById("contadorVagas");

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
  if (!iso) return "data não informada";
  const data = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(data.getTime())) return "data não informada";
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   NAVEGAÇÃO PARA DETALHES
   ========================================================= */
function irParaDetalhes(id) {
  if (!id) return;
  window.location.href = `./detalhes_voluntariado.html?id=${id}`;
}

/* =========================================================
   CARD
   ========================================================= */
function criarCard(vaga) {
  const status = STATUS_INFO[vaga.status] || STATUS_INFO.ENCERRADA;
  const { dia, mes, ano } = decomporData(vaga.data_inicio);

  const card = document.createElement("article");
  card.className = "vaga-card";
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `${vaga.titulo}. Status ${status.texto}. Local: ${vaga.local}. ` +
      `Início: ${dataCompleta(vaga.data_inicio)}. Jornada: ${vaga.jornada_trabalho}. ` +
      `Clique para ver detalhes.`,
  );

  card.innerHTML = `
        <div class="vaga-faixa" aria-hidden="true">
            <span class="faixa-mes">${mes}</span>
            <span class="faixa-dia">${dia}</span>
            <span class="faixa-ano">${ano}</span>
        </div>

        <div class="vaga-conteudo">
            <div class="vaga-topo">
                <h3 class="vaga-titulo">${vaga.titulo}</h3>
                <span class="vaga-status ${status.classe}">${status.texto}</span>
            </div>

            <div class="vaga-meta">
                <span>
                    <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                    ${vaga.local}
                </span>
                <span>
                    <i class="fa-regular fa-clock" aria-hidden="true"></i>
                    ${vaga.jornada_trabalho}
                </span>
            </div>
        </div>

        <div class="vaga-seta" aria-hidden="true">
            <i class="fa-solid fa-arrow-right"></i>
        </div>
    `;

  /* Clique */
  card.addEventListener("click", () => irParaDetalhes(vaga.id));

  /* Teclado (role="button") */
  card.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      irParaDetalhes(vaga.id);
    }
  });

  return card;
}

/* =========================================================
   RENDER
   ========================================================= */
function renderizar(vagas) {
  if (!corpo) return;

  corpo.innerHTML = "";

  if (!vagas.length) {
    corpo.innerHTML = `<p class="vagas-mensagem">Nenhuma vaga disponível no momento.</p>`;
    if (contadorVagas) contadorVagas.textContent = "0 vagas";
    return;
  }

  const fragmento = document.createDocumentFragment();
  vagas.forEach((v) => fragmento.appendChild(criarCard(v)));
  corpo.appendChild(fragmento);

  if (contadorVagas) {
    contadorVagas.textContent = `${vagas.length} ${vagas.length === 1 ? "vaga" : "vagas"}`;
  }
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
function init() {
  const abertas = VAGAS.filter((v) => v.status !== "ENCERRADA");
  renderizar(abertas);
}

init();
