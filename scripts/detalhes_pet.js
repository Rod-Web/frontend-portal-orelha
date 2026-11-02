// scripts/detalhes_pet.js

const API_URL = "http://localhost:3000/pet";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id")) || 1;

/* Elementos */
const elNome = document.getElementById("petNome");
const elHistoria = document.getElementById("petHistoria");
const elDados = document.getElementById("petDados");
const elImagem = document.getElementById("petImagem");
const elStatus = document.getElementById("petStatus");

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
const DIAS_POR_ANO = 365;
const DIAS_POR_MES = 30.44;
const DIAS_POR_SEMANA = 7;

/* =========================================================
   PORTE — faixas por espécie (em kg)
   ========================================================= */
const FAIXAS_PORTE = {
  CACHORRO: { pequeno: 10, medio: 25 }, // > 25 kg = grande
  GATO: { pequeno: 4, medio: 6 }, // > 6  kg = grande
};

/* Fallback para espécies desconhecidas — usa faixas de cachorro */
const FAIXA_PADRAO = { pequeno: 10, medio: 25 };

function faixaDaEspecie(especie) {
  const chave = String(especie || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (chave.includes("GATO") || chave.includes("FELINO"))
    return FAIXAS_PORTE.GATO;
  if (
    chave.includes("CACHORRO") ||
    chave.includes("CAO") ||
    chave.includes("CANINO")
  )
    return FAIXAS_PORTE.CACHORRO;

  return FAIXA_PADRAO;
}

/* Retorna "Pequeno" | "Médio" | "Grande" */
function classePorte(pesoKg, especie) {
  const faixa = faixaDaEspecie(especie);
  if (pesoKg <= faixa.pequeno) return "Pequeno";
  if (pesoKg <= faixa.medio) return "Médio";
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
   UTILIDADES
   ========================================================= */
function capitalizar(texto) {
  return texto ? texto.charAt(0) + texto.slice(1).toLowerCase() : "—";
}

function formatarSexo(sexo) {
  if (!sexo) return "—";
  if (sexo === "FEMEA" || sexo === "FÊMEA") return "Fêmea";
  if (sexo === "MACHO") return "Macho";
  return capitalizar(sexo);
}

function formatarPeso(peso) {
  const n = parseFloat(peso);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2).replace(".", ",")} kg`;
}

function formatarStatus(status) {
  if (!status) return "Esperando por um lar";
  if (status === "DISPONIVEL") return "Disponível para adoção";
  if (status === "ADOTADO") return "Já foi adotado 🏠";
  return capitalizar(status);
}

/* =========================================================
   RENDER
   ========================================================= */
function preencherPagina(pet) {
  const pesoKg = parseFloat(pet.peso) || 0;

  /* Imagem + fallback */
  if (elImagem) {
    elImagem.src = pet.imagem || PLACEHOLDER;
    elImagem.alt = `Foto de ${pet.nome || "pet"}`;
    elImagem.onerror = () => {
      elImagem.onerror = null;
      elImagem.src = PLACEHOLDER;
    };
  }

  /* Selo de status na foto */
  if (elStatus) {
    const statusTexto = formatarStatus(pet.status);
    elStatus.innerHTML =
      pet.status === "ADOTADO"
        ? `<i class="fa-solid fa-house"></i> ${statusTexto}`
        : `<i class="fa-solid fa-heart"></i> ${statusTexto}`;
  }

  /* Nome */
  if (elNome) elNome.textContent = pet.nome || "Sem nome";

  /* Descrição */
  if (elHistoria) {
    elHistoria.textContent =
      pet.descricao || "Este pet ainda não possui descrição cadastrada.";
  }

  /* Linha resumo: idade · sexo · raça · porte · peso · espécie */
  if (elDados) {
    elDados.innerHTML = `
            <span>${idadeTexto(pet)}</span>
            <span>${formatarSexo(pet.sexo)}</span>
            <span>${pet.raca || "SRD"}</span>
            <span>${labelPorte(pesoKg, pet.especie)}</span>
            <span>${formatarPeso(pet.peso)}</span>
            <span>${capitalizar(pet.especie)}</span>
        `;
  }

  /* Título da aba */
  document.title = `Portal Orelha | ${pet.nome || "Pet"}`;
}

/* =========================================================
   CARREGAR PET
   ========================================================= */
async function carregarPet() {
  try {
    const resposta = await fetch(`${API_URL}/numero_identificacao/${id}`);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = await resposta.json();

    /* Normaliza: array OU objeto */
    const pet = Array.isArray(dados) ? dados[0] : dados;

    if (!pet) {
      if (elNome) elNome.textContent = "Pet não encontrado";
      if (elHistoria)
        elHistoria.textContent =
          "Não encontramos esse pet. Ele pode já ter sido adotado.";
      return;
    }

    preencherPagina(pet);
  } catch (erro) {
    console.error("Erro ao carregar pet:", erro);

    if (elNome) elNome.textContent = "Erro ao carregar";
    if (elHistoria) {
      elHistoria.textContent =
        "Não foi possível carregar as informações deste pet. Verifique se a API está rodando em http://localhost:3000.";
    }
  }
}

carregarPet();
