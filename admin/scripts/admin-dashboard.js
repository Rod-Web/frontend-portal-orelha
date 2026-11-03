// ./admin/scripts/dashboard.js
import { fetchCapturarPets } from "./requisicao/fetchCapturarPets.js";
import { mostrarAviso } from "./components/modal.js";

/* =========================================================
   CONTADORES DO TOPO
   ========================================================= */
async function quantidadePets() {
  const tagTotalPets = document.getElementById("totalPets");

  const resultado = await fetchCapturarPets();
  if (resultado.erro) {
    return mostrarAviso(resultado.erro, null, "Erro");
  }

  tagTotalPets.textContent = resultado.length;
}

async function quantidadePetsStatus(status, index) {
  const tagTotalPetsAdotados = document.getElementById("totalAdotados");
  const tagTotalPetsDisponiveis = document.getElementById("totalDisponiveis");
  const tags = [tagTotalPetsDisponiveis, tagTotalPetsAdotados];

  const resultado = await fetchCapturarPets();
  if (resultado.erro) {
    return mostrarAviso(resultado.erro, null, "Erro");
  }

  const petsComStatus = resultado.filter((el) => el.status === status);
  tags[index].textContent = petsComStatus.length;
}

/* =========================================================
   ÚLTIMOS PETS (cards no dashboard)
   ========================================================= */

/* SVG fallback (nunca dá 404) */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <rect width='300' height='300' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='48' fill='#63291e'>🐾</text>
</svg>
`);

function capitalizar(t) {
  return t ? t.charAt(0) + t.slice(1).toLowerCase() : "—";
}

function formatarSexo(s) {
  if (!s) return "—";
  const v = s.toUpperCase();
  return v === "FEMEA" || v === "FÊMEA" ? "Fêmea" : "Macho";
}

function statusInfo(status) {
  const v = (status || "").toUpperCase();
  if (v === "ADOTADO") return { texto: "Adotado", classe: "adotado" };
  if (v === "EM_PROCESSO") return {texto: "Em processo", classe: "em_processo"}
  return { texto: "Disponível", classe: "disponivel" };
}

function criarCardPet(pet) {
  const s = statusInfo(pet.status);

  const card = document.createElement("a");
  card.className = "pet-card";
  card.href = `./editar-pet.html?id=${pet.numero_identificacao}`;
  card.title = `Editar ${pet.nome || "pet"}`;

  card.innerHTML = `
    <div class="pet-foto">
        <img src="${pet.imagem || PLACEHOLDER}" alt="${pet.nome || "Pet"}"
             onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
    </div>
    <div class="pet-info">
        <strong>${pet.nome || "Sem nome"}</strong>
        <span>
            ${capitalizar(pet.especie)} · ${formatarSexo(pet.sexo)} · ${pet.idade || "—"}
        </span>
        <span class="pet-status ${s.classe}">${s.texto}</span>
    </div>
  `;

  return card;
}

async function renderizarUltimosPets() {
  const grade = document.getElementById("gradePets");
  if (!grade) return;

  const resultado = await fetchCapturarPets();

  if (resultado?.erro) {
    grade.innerHTML = `<p class="carregando">${resultado.erro}</p>`;
    return;
  }

  const pets = Array.isArray(resultado) ? resultado : resultado.pets || [];

  if (!pets.length) {
    grade.innerHTML = `<p class="carregando">Nenhum pet cadastrado ainda.</p>`;
    return;
  }

  /* Últimos 4 (assumindo que a API devolve em ordem de cadastro) */
  const ultimos = pets.slice(-4).reverse();

  grade.innerHTML = "";
  const frag = document.createDocumentFragment();
  ultimos.forEach((pet) => frag.appendChild(criarCardPet(pet)));
  grade.appendChild(frag);
}

/* =========================================================
   LINK "VER TODOS →"
   ========================================================= */
const linkVerTodos = document.querySelector(".ver-todos");
if (linkVerTodos) {
  linkVerTodos.href = "./pets.html";
}

/* =========================================================
   INICIALIZA
   ========================================================= */
quantidadePets();
quantidadePetsStatus("DISPONIVEL", 0);
quantidadePetsStatus("ADOTADO", 1);
renderizarUltimosPets();
