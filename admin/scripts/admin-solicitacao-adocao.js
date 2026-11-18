// ./admin/scripts/admin-solicitacao-adocao.js

import { fetchCapturarSolicitacaoAdocao } from "./requisicao/fetchCapturarSolicitacaoAdocao.js";
import { fetchEditarStatusSolicitacao } from "./requisicao/fetchEditarStatusSolicitacao.js";
import { fetchEditarStatusPet } from "./requisicao/fetchEditarStatusPet.js";
import { fetchCapturarPets } from "./requisicao/fetchCapturarPets.js";

/* =========================================================
   ELEMENTOS
   ========================================================= */
const solicitacaoIdEl = document.getElementById("solicitacaoId");
const statusBadgeEl = document.getElementById("statusBadge");
const infoDataEl = document.getElementById("infoData");
const conteudoCarregado = document.getElementById("conteudoCarregado");
const estadoErro = document.getElementById("estadoErro");
const estadoErroTexto = document.getElementById("estadoErroTexto");

// Candidato
const candNome = document.getElementById("candNome");
const candIdade = document.getElementById("candIdade");
const candProfissao = document.getElementById("candProfissao");
const candEmail = document.getElementById("candEmail");
const candTelefone = document.getElementById("candTelefone");
const candCep = document.getElementById("candCep");
const candEndereco = document.getElementById("candEndereco");

// Residência
const resSeguranca = document.getElementById("resSeguranca");
const resComodos = document.getElementById("resComodos");
const resPessoas = document.getElementById("resPessoas");
const resFamilia = document.getElementById("resFamilia");
const resCriancas = document.getElementById("resCriancas");

// Animais
const anPossui = document.getElementById("anPossui");
const anAnteriores = document.getElementById("anAnteriores");
const anDescricaoWrap = document.getElementById("anDescricaoWrap");
const anDescricao = document.getElementById("anDescricao");
const anRacaoWrap = document.getElementById("anRacaoWrap");
const anRacao = document.getElementById("anRacao");
const anVetWrap = document.getElementById("anVetWrap");
const anVet = document.getElementById("anVet");
const anAnterioresDescWrap = document.getElementById("anAnterioresDescWrap");
const anAnterioresDesc = document.getElementById("anAnterioresDesc");

// Cuidados
const cuiResponsavel = document.getElementById("cuiResponsavel");
const cuiRotina = document.getElementById("cuiRotina");
const cuiCompromisso = document.getElementById("cuiCompromisso");

// Pet
const petImagem = document.getElementById("petImagem");
const petNome = document.getElementById("petNome");
const petStatus = document.getElementById("petStatus");
const petEspecie = document.getElementById("petEspecie");
const petRaca = document.getElementById("petRaca");
const petSexo = document.getElementById("petSexo");
const petIdade = document.getElementById("petIdade");
const petPeso = document.getElementById("petPeso");
const petDescricao = document.getElementById("petDescricao");
const petLink = document.getElementById("petLink");

// Modal
const modalConfirmar = document.getElementById("modalConfirmar");
const modalIcone = document.getElementById("modalIcone");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const modalCancelar = document.getElementById("modalCancelar");
const modalConfirmarBtn = document.getElementById("modalConfirmarBtn");

// Toast
const toastEl = document.getElementById("toast");

/* =========================================================
   ESTADO
   ========================================================= */
const params = new URLSearchParams(location.search);
const solicitacaoId = Number(params.get("id"));

let solicitacao = null;
let pet = null;
let acaoEmAndamento = false;
let acaoPendente = null;

/* =========================================================
   PLACEHOLDER
   ========================================================= */
const PLACEHOLDER_PET =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
  <rect width='400' height='300' fill='#ead8c4'/>
  <text x='50%' y='50%' text-anchor='middle' dy='.3em'
        font-family='sans-serif' font-size='64' fill='#63291e'>🐾</text>
</svg>
`);

/* =========================================================
   HELPERS
   ========================================================= */

const DIAS_POR_ANO = 365;
const DIAS_POR_MES = 30.44;
const DIAS_POR_SEMANA = 7;

function idadeTexto(p) {
  if (!p) return "—";
  if (p.idade) return p.idade;

  const dias = Number(p.idade_aproximada_em_dias);
  if (!Number.isFinite(dias) || dias < 0) return "—";

  if (dias < DIAS_POR_SEMANA) {
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }
  if (dias < DIAS_POR_MES) {
    const s = Math.floor(dias / DIAS_POR_SEMANA);
    return `${s} ${s === 1 ? "semana" : "semanas"}`;
  }
  if (dias < DIAS_POR_ANO) {
    const m = Math.round(dias / DIAS_POR_MES);
    return `${m} ${m === 1 ? "mês" : "meses"}`;
  }
  const a = Math.floor(dias / DIAS_POR_ANO);
  return `${a} ${a === 1 ? "ano" : "anos"}`;
}

function formatarData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarCep(cep) {
  if (!cep) return "—";
  const d = String(cep).replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return cep;
}

function formatarTelefone(tel) {
  if (!tel) return "—";
  const d = String(tel).replace(/\D/g, "");
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel;
}

function formatarPeso(peso) {
  const n = parseFloat(peso);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(2).replace(".", ",")} kg`;
}

function capitalizar(t) {
  return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "—";
}

function formatarEspecie(e) {
  if (!e) return "—";
  const v = String(e).toUpperCase();
  if (v === "CACHORRO" || v === "CAO" || v === "CANINO") return "Cachorro";
  if (v === "GATO" || v === "FELINO") return "Gato";
  return capitalizar(e);
}

function formatarSexo(s) {
  if (!s) return "—";
  const v = String(s).toUpperCase();
  if (v === "FEMEA" || v === "FÊMEA") return "Fêmea";
  if (v === "MACHO") return "Macho";
  return capitalizar(s);
}

function labelStatus(status) {
  if (status === "PENDENTE") return "Pendente";
  if (status === "EM_ANALISE") return "Em análise";
  if (status === "APROVADA") return "Aprovada";
  if (status === "REPROVADA") return "Reprovada";
  return status || "—";
}

function classeStatus(status) {
  if (status === "PENDENTE") return "pendente";
  if (status === "EM_ANALISE") return "em_analise";
  if (status === "APROVADA") return "aprovada";
  if (status === "REPROVADA") return "reprovada";
  return "";
}

function labelPetStatus(status) {
  const v = String(status || "").toUpperCase();
  if (v === "DISPONIVEL") return "Disponível";
  if (v === "ADOTADO") return "Adotado";
  if (v === "EM_PROCESSO") return "Em processo";
  return status || "—";
}

function classePetStatus(status) {
  const v = String(status || "").toUpperCase();
  if (v === "DISPONIVEL") return "aberta";
  if (v === "ADOTADO") return "adotado";
  if (v === "EM_PROCESSO") return "encerrada";
  return "encerrada";
}

function escaparHtml(texto) {
  return String(texto ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function badgeSimNao(valor, el) {
  const sim = Number(valor) === 1 || valor === true || valor === "1";
  el.textContent = sim ? "Sim" : "Não";
  el.className = `badge-sim-nao ${sim ? "sim" : "nao"}`;
}

function renderizarChips(el, texto) {
  el.innerHTML = "";
  if (!texto || !texto.trim()) {
    const span = document.createElement("span");
    span.className = "chip vazio";
    span.textContent = "Não informado";
    el.appendChild(span);
    return;
  }
  texto
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = item;
      el.appendChild(chip);
    });
}

function normalizarNumeroWhatsapp(tel) {
  const d = String(tel || "").replace(/\D/g, "");
  if (d.length === 10) return d.slice(0, 2) + "9" + d.slice(2);
  return d;
}

function valorOuTraco(v) {
  return v && String(v).trim() ? v : "—";
}

/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */

function renderizar() {
  // Cabeçalho
  solicitacaoIdEl.textContent = `#${solicitacao.id}`;
  statusBadgeEl.textContent = labelStatus(solicitacao.status);
  statusBadgeEl.className = `badge-status ${classeStatus(solicitacao.status)}`;
  infoDataEl.textContent = `Recebida em ${formatarData(solicitacao.data_solicitacao)}`;

  // Candidato
  candNome.textContent = solicitacao.nome_completo || "—";
  candIdade.textContent = solicitacao.idade ? `${solicitacao.idade} anos` : "—";
  candProfissao.textContent = solicitacao.profissao || "—";
  candCep.textContent = formatarCep(solicitacao.cep);
  candEndereco.textContent = solicitacao.endereco_completo || "—";

  if (solicitacao.email) {
    candEmail.textContent = solicitacao.email;
    candEmail.href = `mailto:${solicitacao.email}`;
  } else {
    candEmail.textContent = "—";
    candEmail.removeAttribute("href");
  }

  if (solicitacao.telefone_contato) {
    candTelefone.textContent = formatarTelefone(solicitacao.telefone_contato);
    candTelefone.href = `tel:${String(solicitacao.telefone_contato).replace(/\D/g, "")}`;
  } else {
    candTelefone.textContent = "—";
    candTelefone.removeAttribute("href");
  }

  // Residência
  resSeguranca.textContent = solicitacao.medidas_seguranca_residencial || "—";
  renderizarChips(resComodos, solicitacao.comodos_acesso_animal);
  resPessoas.textContent = solicitacao.quantidade_pessoas_residencia || "—";
  badgeSimNao(solicitacao.familia_ciente_concorda, resFamilia);
  resCriancas.textContent = solicitacao.crianca_convivio || "—";

  // Animais
  const possuiOutros = Number(solicitacao.possui_outros_animais) === 1;
  const teveAntes = Number(solicitacao.animais_anteriores) === 1;

  badgeSimNao(solicitacao.possui_outros_animais, anPossui);
  badgeSimNao(solicitacao.animais_anteriores, anAnteriores);

  if (possuiOutros) {
    anDescricaoWrap.hidden = false;
    anDescricao.textContent = valorOuTraco(
      solicitacao.descricao_animais_existentes,
    );

    if (solicitacao.racao_atual) {
      anRacaoWrap.hidden = false;
      anRacao.textContent = solicitacao.racao_atual;
    } else {
      anRacaoWrap.hidden = true;
    }

    if (solicitacao.veterinario_responsavel) {
      anVetWrap.hidden = false;
      anVet.textContent = solicitacao.veterinario_responsavel;
    } else {
      anVetWrap.hidden = true;
    }
  } else {
    anDescricaoWrap.hidden = true;
    anRacaoWrap.hidden = true;
    anVetWrap.hidden = true;
  }

  if (teveAntes) {
    anAnterioresDescWrap.hidden = false;
    anAnterioresDesc.textContent = valorOuTraco(
      solicitacao.descricao_animais_anteriores,
    );
  } else {
    anAnterioresDescWrap.hidden = true;
  }

  // Cuidados
  cuiResponsavel.textContent = solicitacao.cuidador_direto || "—";
  cuiRotina.textContent = solicitacao.rotina_familiar || "—";
  badgeSimNao(solicitacao.compromisso_adocao_responsavel, cuiCompromisso);

  // Pet
  if (pet) {
    petImagem.src = pet.imagem || PLACEHOLDER_PET;
    petImagem.alt = `Foto de ${pet.nome || "pet"}`;
    petImagem.onerror = () => {
      petImagem.onerror = null;
      petImagem.src = PLACEHOLDER_PET;
    };

    petNome.textContent = pet.nome || "—";
    petStatus.textContent = labelPetStatus(pet.status);
    petStatus.className = `badge-oportunidade ${classePetStatus(pet.status)}`;

    petEspecie.textContent = formatarEspecie(pet.especie);
    petRaca.textContent = pet.raca || "SRD";
    petSexo.textContent = formatarSexo(pet.sexo);
    petIdade.textContent = idadeTexto(pet);
    petPeso.textContent = formatarPeso(pet.peso);
    petDescricao.textContent = pet.descricao || "Sem descrição cadastrada.";

    petLink.href = `./editar-pet.html?id=${pet.numero_identificacao}`;
  } else {
    petImagem.src = PLACEHOLDER_PET;
    petImagem.alt = "Pet não encontrado";
    petNome.textContent = `Pet #${solicitacao.id_pet}`;
    petStatus.textContent = "—";
    petStatus.className = "badge-oportunidade encerrada";
    petEspecie.textContent = "—";
    petRaca.textContent = "—";
    petSexo.textContent = "—";
    petIdade.textContent = "—";
    petPeso.textContent = "—";
    petDescricao.textContent = "Não foi possível carregar os dados do pet.";
    petLink.href = "#";
    petLink.style.display = "none";
  }

  // Botões: só desabilita ações finais
  document.querySelectorAll(".botao-acao").forEach((btn) => {
    const acao = btn.dataset.acao;
    const ehAcaoFinal = acao === "APROVADA" || acao === "REPROVADA";
    const ehStatusAtual = acao === solicitacao.status;

    if (ehAcaoFinal && ehStatusAtual) {
      btn.classList.add("atual");
      btn.disabled = true;
    } else {
      btn.classList.remove("atual");
      btn.disabled = false;
    }
  });

  conteudoCarregado.hidden = false;
}

/* =========================================================
   CARREGAMENTO
   ========================================================= */

async function carregarTudo() {
  estadoErro.hidden = true;

  if (!solicitacaoId || Number.isNaN(solicitacaoId)) {
    estadoErroTexto.textContent = "ID da solicitação inválido na URL.";
    estadoErro.hidden = false;
    infoDataEl.textContent = "";
    return;
  }

  const [resSolicitacao, resPets] = await Promise.all([
    fetchCapturarSolicitacaoAdocao(solicitacaoId),
    fetchCapturarPets(),
  ]);

  if (resSolicitacao?.erro) {
    estadoErroTexto.textContent = resSolicitacao.erro;
    estadoErro.hidden = false;
    infoDataEl.textContent = "";
    return;
  }

  solicitacao = resSolicitacao;

  const pets = Array.isArray(resPets) ? resPets : resPets?.pets || [];
  pet = pets.find((p) => p.numero_identificacao === solicitacao.id_pet) || null;

  renderizar();
  estadoErro.hidden = true;
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function mostrarToast(mensagem, tipo = "sucesso") {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.textContent = mensagem;
  toastEl.className = `toast ${tipo}`;
  toastEl.hidden = false;
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3600);
}

/* =========================================================
   MODAL DE CONFIRMAÇÃO
   ========================================================= */

function pedirConfirmacao({ titulo, texto, icone, cor, onConfirm }) {
  modalTitulo.textContent = titulo;
  modalTexto.textContent = texto;

  modalIcone.className = `modal-icone ${cor || ""}`;
  modalIcone.innerHTML = `<i class="fa-solid ${icone || "fa-circle-question"}"></i>`;

  acaoPendente = onConfirm;
  modalConfirmar.hidden = false;
}

function fecharModal() {
  modalConfirmar.hidden = true;
  acaoPendente = null;
}

modalCancelar?.addEventListener("click", fecharModal);

modalConfirmar?.addEventListener("click", (e) => {
  if (e.target === modalConfirmar) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalConfirmar.hidden) fecharModal();
});

modalConfirmarBtn?.addEventListener("click", () => {
  const fn = acaoPendente;
  fecharModal();
  if (fn) fn();
});

/* =========================================================
   EXECUÇÃO DAS AÇÕES
   ---------------------------------------------------------
   Regras:
     REPROVADA   →  solicitação REPROVADA + pet DISPONIVEL
     APROVADA    →  solicitação APROVADA  + pet ADOTADO
     EM_ANALISE  →  solicitação EM_ANALISE (pet não muda)
   ========================================================= */

function desabilitarBotoes(desabilitar) {
  document.querySelectorAll(".botao-acao").forEach((btn) => {
    btn.disabled = desabilitar;
  });
}

function abrirWhatsAppNovaAba(telefone) {
  const numero = normalizarNumeroWhatsapp(telefone);
  if (numero.length !== 11) return false;

  const whatsappUrl = `https://wa.me/55${numero}`;

  const link = document.createElement("a");
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}

async function executarAcao(status) {
  if (acaoEmAndamento) return;
  acaoEmAndamento = true;
  desabilitarBotoes(true);

  // 1) Atualiza status da SOLICITAÇÃO
  const resultado = await fetchEditarStatusSolicitacao(solicitacaoId, status);

  if (resultado.erro) {
    mostrarToast(resultado.erro, "falha");
    desabilitarBotoes(false);
    acaoEmAndamento = false;
    return;
  }

  // 2) Atualiza status do PET — só ações finais mudam
  const mapaStatusPet = {
    REPROVADA: "DISPONIVEL",
    APROVADA: "ADOTADO",
    // EM_ANALISE: undefined → pet não muda
  };

  const novoStatusPet = mapaStatusPet[status];

  if (pet && novoStatusPet) {
    const resPet = await fetchEditarStatusPet(
      pet.numero_identificacao,
      novoStatusPet,
    );

    if (resPet.erro) {
      mostrarToast(
        `Solicitação atualizada, mas o pet não pôde ser atualizado: ${resPet.erro}`,
        "falha",
      );
    }
  }

  // 3) Feedback específico + ação extra
  if (status === "APROVADA") {
    mostrarToast("Adoção aprovada. Pet marcado como adotado. 🐾", "sucesso");
  } else if (status === "REPROVADA") {
    mostrarToast(
      "Solicitação recusada. Pet voltou a ficar disponível.",
      "sucesso",
    );
  } else if (status === "EM_ANALISE") {
    const abriu = abrirWhatsAppNovaAba(solicitacao.telefone_contato);

    if (abriu) {
      mostrarToast(
        "Solicitação em análise. WhatsApp aberto em nova aba.",
        "sucesso",
      );
    } else {
      mostrarToast(
        "Status atualizado, mas o telefone não é válido para WhatsApp.",
        "falha",
      );
    }
  }

  // 4) Volta pra lista
  setTimeout(() => {
    window.location.href = "./solicitacoes-adocao.html";
  }, 900);
}

/* =========================================================
   EVENTOS DOS BOTÕES
   ========================================================= */

document.querySelectorAll(".botao-acao").forEach((btn) => {
  btn.addEventListener("click", () => {
    const status = btn.dataset.acao;
    const nome = solicitacao?.nome_completo || "este candidato";
    const nomePet = pet?.nome || "este pet";

    if (status === "REPROVADA") {
      pedirConfirmacao({
        titulo: "Recusar solicitação?",
        texto: `A solicitação de ${nome} será marcada como reprovada e ${nomePet} voltará a ficar disponível para adoção.`,
        icone: "fa-xmark",
        cor: "perigo",
        onConfirm: () => executarAcao("REPROVADA"),
      });
    } else if (status === "EM_ANALISE") {
      pedirConfirmacao({
        titulo: "Entrar em contato?",
        texto: `A solicitação será marcada como "em análise" e o WhatsApp de ${nome} será aberto em uma nova aba.`,
        icone: "fa-comment-dots",
        cor: "contato",
        onConfirm: () => executarAcao("EM_ANALISE"),
      });
    } else if (status === "APROVADA") {
      pedirConfirmacao({
        titulo: "Aprovar adoção?",
        texto: `A solicitação de ${nome} será aprovada e ${nomePet} será marcado como adotado.`,
        icone: "fa-check",
        cor: "sucesso",
        onConfirm: () => executarAcao("APROVADA"),
      });
    }
  });
});

/* =========================================================
   INIT
   ========================================================= */

carregarTudo();
