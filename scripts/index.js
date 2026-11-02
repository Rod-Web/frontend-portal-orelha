// scripts/index.js

/* =========================================================
   CARROSSEL
   ========================================================= */
const slides = document.querySelectorAll(".slide");
const pontos = document.querySelectorAll(".ponto");
const botaoAnterior = document.querySelector(".seta.anterior");
const botaoProximo = document.querySelector(".seta.proxima");

let slideAtual = 0;
let temporizador;

function mostrarSlide(indice) {
  if (!slides.length) return;

  slides[slideAtual].classList.remove("ativo");
  pontos[slideAtual]?.classList.remove("selecionado");

  slideAtual = (indice + slides.length) % slides.length;

  slides[slideAtual].classList.add("ativo");
  pontos[slideAtual]?.classList.add("selecionado");
}

function reiniciarCarrossel() {
  clearInterval(temporizador);
  if (slides.length) {
    temporizador = setInterval(() => mostrarSlide(slideAtual + 1), 5000);
  }
}

botaoAnterior?.addEventListener("click", () => {
  mostrarSlide(slideAtual - 1);
  reiniciarCarrossel();
});

botaoProximo?.addEventListener("click", () => {
  mostrarSlide(slideAtual + 1);
  reiniciarCarrossel();
});

pontos.forEach((ponto, indice) => {
  ponto.addEventListener("click", () => {
    mostrarSlide(indice);
    reiniciarCarrossel();
  });
});

if (slides.length) reiniciarCarrossel();

/* =========================================================
   PETS EM DESTAQUE (API)
   ========================================================= */
const API_URL  = "http://localhost:3000/pet";
const gradePets = document.getElementById("gradePets");

/* =========================================================
   PLACEHOLDER (SVG embutido — nunca dá 404)
   ========================================================= */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
  <rect width='600' height='600' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='72' fill='#63291e'>🐾</text>
</svg>
`);

/* =========================================================
   CONSTANTES DE TEMPO
   ========================================================= */
const DIAS_POR_ANO    = 365;
const DIAS_POR_MES    = 30.44;
const DIAS_POR_SEMANA = 7;

/* =========================================================
   PORTE — faixas por espécie (em kg)
   ========================================================= */
const FAIXAS_PORTE = {
  CACHORRO: { pequeno: 10, medio: 25 },   // > 25 kg = grande
  GATO:     { pequeno: 4,  medio: 6  },   // > 6  kg = grande
};

const FAIXA_PADRAO = { pequeno: 10, medio: 25 };

function faixaDaEspecie(especie) {
  const chave = String(especie || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (chave.includes("GATO") || chave.includes("FELINO")) return FAIXAS_PORTE.GATO;
  if (chave.includes("CACHORRO") || chave.includes("CAO") || chave.includes("CANINO"))
    return FAIXAS_PORTE.CACHORRO;

  return FAIXA_PADRAO;
}

function classePorte(pesoKg, especie) {
  const faixa = faixaDaEspecie(especie);
  if (pesoKg <= faixa.pequeno) return "Pequeno";
  if (pesoKg <= faixa.medio)   return "Médio";
  return "Grande";
}

function labelPorte(pesoKg, especie) {
  return `Porte ${classePorte(pesoKg, especie).toLowerCase()}`;
}

/* =========================================================
   IDADE — a partir de dias
   ========================================================= */
function idadeEmDias(pet) {
  const dias = Number(pet.idade_aproximada_em_dias);
  return Number.isFinite(dias) && dias >= 0 ? dias : null;
}

function idadeTexto(pet) {
  const dias = idadeEmDias(pet);
  if (dias === null) return "—";

  if (dias < DIAS_POR_SEMANA) {
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }
  if (dias < DIAS_POR_MES) {
    const sem = Math.floor(dias / DIAS_POR_SEMANA);
    return `${sem} ${sem === 1 ? "semana" : "semanas"}`;
  }
  if (dias < DIAS_POR_ANO) {
    const meses = Math.round(dias / DIAS_POR_MES);
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }
  const anos = Math.floor(dias / DIAS_POR_ANO);
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

/* =========================================================
   UTILIDADES GERAIS
   ========================================================= */
function capitalizar(texto) {
  return texto ? texto.charAt(0) + texto.slice(1).toLowerCase() : "";
}

function formatarSexo(sexo) {
  if (sexo === "FEMEA" || sexo === "FÊMEA") return "Fêmea";
  if (sexo === "MACHO") return "Macho";
  return "—";
}

/* =========================================================
   CARD DE DESTAQUE
   ========================================================= */
function criarCardDestaque(pet) {
  const pesoKg = parseFloat(pet.peso) || 0;

  const card = document.createElement("a");
  card.className = "pet-card";
  card.href = `./pages/detalhes_pet.html?id=${pet.numero_identificacao}`;

  card.innerHTML = `
        <div class="pet-foto">
            <img src="${pet.imagem || PLACEHOLDER}" alt="${pet.nome}"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
        </div>
        <div class="pet-info">
            <h3>${pet.nome}</h3>
            <span>${formatarSexo(pet.sexo)} · ${idadeTexto(pet)} · ${labelPorte(pesoKg, pet.especie)}</span>
            <p>✦ ${capitalizar(pet.especie)}</p>
        </div>
    `;

  return card;
}

/* =========================================================
   CARREGAR DESTAQUES
   ========================================================= */
async function carregarDestaques() {
  if (!gradePets) return;

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const pets = await resposta.json();

    // Mostra apenas os 4 primeiros disponíveis
    const destaques = pets
      .filter((p) => p && p.numero_identificacao != null)
      .filter((p) => p.status === "DISPONIVEL" || !p.status)
      .slice(0, 4);

    gradePets.innerHTML = "";

    if (!destaques.length) {
      gradePets.innerHTML = `<p class="mensagem">Nenhum pet disponível no momento.</p>`;
      return;
    }

    const fragmento = document.createDocumentFragment();
    destaques.forEach((pet) => fragmento.appendChild(criarCardDestaque(pet)));
    gradePets.appendChild(fragmento);
  } catch (erro) {  
    console.error("Erro ao carregar pets em destaque:", erro);
    gradePets.innerHTML = `<p class="mensagem">Não foi possível carregar os pets em destaque.</p>`;
  }
}

carregarDestaques();