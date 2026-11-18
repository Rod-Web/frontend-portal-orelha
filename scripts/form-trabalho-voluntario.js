// ./scripts/forms-trabalho-voluntario.js

import { perguntas } from "./forms-questions/solicitacao-trabalho-voluntario.js";
import url from "../../ambiente.js";

let indice = 0;
const respostas = {};

const area = document.getElementById("pergunta");
const contador = document.getElementById("contador");
const progresso = document.getElementById("progresso");
const voltar = document.getElementById("voltar");
const proximo = document.getElementById("proximo");
const linkVoltar = document.getElementById("linkVoltar");

// ─────────────────────────────────────────────────────────────
// 🐾 ID da vaga que veio da página de detalhes_voluntariado
// Aceita ?trabalho=..., ?vaga=..., ?id=... ou ?servico=...
// ─────────────────────────────────────────────────────────────
const TRABALHO_ID = (() => {
  const params = new URLSearchParams(location.search);
  const raw =
    params.get("trabalho") ||
    params.get("vaga") ||
    params.get("id") ||
    params.get("servico");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
})();

// Ajusta o link "Voltar" para retornar à vaga específica
if (TRABALHO_ID && linkVoltar) {
  linkVoltar.href = `./detalhes_voluntariado.html?id=${TRABALHO_ID}`;
}

function escapar(texto) {
  return String(texto ?? "").replace(
    /[&<>"']/g,
    (caractere) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caractere],
  );
}

// ==========================================================
// 🔔 NOTIFICAÇÃO PERSONALIZADA (substitui alert)
// ==========================================================

function avisar(mensagem, tipo = "aviso") {
  document.querySelectorAll(".toast-aviso").forEach((t) => t.remove());

  const icone = tipo === "sucesso" ? "✓" : tipo === "erro" ? "!" : "⚠";

  const toast = document.createElement("div");
  toast.className = `toast-aviso toast-aviso--${tipo}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");

  toast.innerHTML = `
        <span class="toast-aviso__icone" aria-hidden="true">${icone}</span>
        <span class="toast-aviso__texto">${escapar(mensagem)}</span>
    `;

  toast.addEventListener("click", () => {
    toast.classList.remove("toast-aviso--visivel");
    setTimeout(() => toast.remove(), 400);
  });

  document.body.appendChild(toast);

  void toast.offsetWidth;
  toast.classList.add("toast-aviso--visivel");

  setTimeout(() => {
    if (!toast.isConnected) return;
    toast.classList.remove("toast-aviso--visivel");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==========================================================
// RENDERIZAÇÃO
// ==========================================================

function desenhar() {
  const p = perguntas[indice];

  contador.textContent = `PERGUNTA ${indice + 1} DE ${perguntas.length}`;
  progresso.style.width = `${((indice + 1) / perguntas.length) * 100}%`;

  voltar.disabled = indice === 0;

  proximo.textContent =
    indice === perguntas.length - 1 ? "Finalizar →" : "Próximo →";

  let campo = "";

  if (p.tipo === "checks") {
    const selecionadas = respostas[p.id] || [];

    campo = `
            <p class="instrucao">
                Selecione todas as opções que se aplicam.
            </p>

            <div class="opcoes-multiplas">
                ${p.opcoes
                  .map(
                    (op) => `
                    <label>
                        <input
                            type="checkbox"
                            name="resposta-multipla"
                            value="${escapar(op)}"
                            ${selecionadas.includes(op) ? "checked" : ""}
                        >
                        ${escapar(op)}
                    </label>
                `,
                  )
                  .join("")}
            </div>
        `;
  } else if (p.tipo === "radio") {
    campo = `
            <div class="opcoes">
                ${p.opcoes
                  .map(
                    (op) => `
                    <label>
                        <input
                            type="radio"
                            name="resposta"
                            value="${escapar(op)}"
                            ${respostas[p.id] === op ? "checked" : ""}
                        >
                        ${escapar(op)}
                    </label>
                `,
                  )
                  .join("")}
            </div>
        `;
  } else if (p.tipo === "textarea") {
    campo = `
            <textarea id="campo" placeholder="Escreva sua resposta...">${escapar(respostas[p.id])}</textarea>
        `;
  } else {
    campo = `
            <input
                id="campo"
                type="${p.tipo}"
                placeholder="Digite sua resposta..."
                value="${escapar(respostas[p.id])}"
                ${p.tipo === "number" ? 'min="0"' : ""}
            >
        `;
  }

  area.innerHTML = `
        <div class="bloco">
            <h2>${p.texto}</h2>
            ${campo}
        </div>
    `;

  if (p.tipo === "tel") {
    const telefone = document.getElementById("campo");

    telefone.placeholder = "(11) 99999-9999";
    telefone.maxLength = 15;
    telefone.inputMode = "numeric";

    telefone.addEventListener("input", () => {
      let numeros = telefone.value.replace(/\D/g, "").slice(0, 11);

      if (numeros.length > 10) {
        numeros = numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (numeros.length > 6) {
        numeros = numeros.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
      } else if (numeros.length > 2) {
        numeros = numeros.replace(/^(\d{2})(\d+)$/, "($1) $2");
      } else if (numeros.length > 0) {
        numeros = "(" + numeros;
      }

      telefone.value = numeros;
    });
  }
}

function obterResposta(p) {
  if (p.tipo === "checks") {
    const selecionadas = [
      ...document.querySelectorAll('input[name="resposta-multipla"]:checked'),
    ].map((input) => input.value);

    if (selecionadas.length === 0) {
      avisar("Selecione pelo menos uma opção antes de continuar.");
      return null;
    }

    return selecionadas;
  }

  if (p.tipo === "radio") {
    return (
      document.querySelector('input[name="resposta"]:checked')?.value || ""
    );
  }

  return document.getElementById("campo").value.trim();
}

// ==========================================================
// VALIDAÇÕES
// ==========================================================

const validacoes = {
  nome(valor) {
    if (valor.length < 3) return "O nome deve ter pelo menos 3 caracteres.";
    if (valor.length > 100) return "O nome deve ter até 100 caracteres.";
    if (!valor.includes(" "))
      return "Por favor, informe seu nome completo (nome e sobrenome).";
    return null;
  },

  idade(valor) {
    const n = Number(valor);
    if (!Number.isFinite(n)) return "Digite um número válido.";
    if (n > 120) return "Digite uma idade válida.";
    return null;
  },

  email(valor) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor))
      return "Digite um e-mail válido.";
    return null;
  },

  tel(valor) {
    const d = valor.replace(/\D/g, "");
    if (d.length !== 10 && d.length !== 11) {
      return "Telefone deve ter DDD + número (10 ou 11 dígitos).";
    }
    return null;
  },

  /**
   * Genérico para campos de texto livre.
   * @param {string} valor
   * @param {string} nomeCampo - aparece na mensagem de erro
   * @param {number} min
   * @param {number} max
   */
  textoLivre(valor, nomeCampo = "Este campo", min = 3, max = 1000) {
    if (valor.length < min)
      return `${nomeCampo} deve ter pelo menos ${min} caracteres.`;
    if (valor.length > max)
      return `${nomeCampo} deve ter até ${max} caracteres.`;
    return null;
  },
};

function validarResposta(p, valor) {
  // Q1 — Nome completo
  if (p.id === 1 && typeof valor === "string") {
    const err = validacoes.nome(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q2 — Idade
  if (p.id === 2) {
    const err = validacoes.idade(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q3 — Email
  if (p.tipo === "email" && typeof valor === "string") {
    const err = validacoes.email(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q4 — Cidade e bairro (5–250)
  if (p.id === 4 && typeof valor === "string") {
    const err = validacoes.textoLivre(valor, "A cidade e bairro", 5, 250);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q5 — Telefone
  if (p.tipo === "tel" && typeof valor === "string") {
    const err = validacoes.tel(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q6 — Profissão atual (3–100)
  if (p.id === 6 && typeof valor === "string") {
    const err = validacoes.textoLivre(valor, "A profissão", 3, 100);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q10 — Experiência em voluntariado (3–1000)
  if (p.id === 10 && typeof valor === "string") {
    const err = validacoes.textoLivre(
      valor,
      "A experiência em voluntariado",
      3,
      1000,
    );
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q11 — Habilidades relevantes (3–1000)
  if (p.id === 11 && typeof valor === "string") {
    const err = validacoes.textoLivre(valor, "As habilidades", 3, 1000);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q12 — Experiência com animais (3–1000)
  if (p.id === 12 && typeof valor === "string") {
    const err = validacoes.textoLivre(
      valor,
      "A experiência com animais",
      3,
      1000,
    );
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  // Q15 — Motivação (3–1000)
  if (p.id === 15 && typeof valor === "string") {
    const err = validacoes.textoLivre(valor, "A motivação", 10, 1000);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }

  return true;
}

// ==========================================================
// MONTAGEM DO PAYLOAD
// ==========================================================

function montarPayload() {
  const dias = Array.isArray(respostas[7]) ? respostas[7] : [];
  const periodos = Array.isArray(respostas[8]) ? respostas[8] : [];

  return {
    id_oportunidade_voluntario: TRABALHO_ID,

    // Dados pessoais
    nome_completo: respostas[1] || "",
    idade: parseInt(respostas[2], 10),
    email: respostas[3] || "",
    endereco_residencial: respostas[4] || "",
    telefone_contato: String(respostas[5] || "").replace(/\D/g, ""),
    profissao_atual: respostas[6] || "",

    // Disponibilidade
    dias_disponiveis: dias.join(", "),
    periodos_disponiveis: periodos.join(", "),
    disponibilidade_durante_jornada: respostas[9] === "Sim",

    // Experiência
    experiencias_anteriores_trabalho_voluntario: respostas[10] || "",
    possui_habilidade_relevante: respostas[11] || "",
    possui_experiencia_animais: respostas[12] || "",

    // Compromisso
    ciente_atividades_responsabilidades: respostas[13] === "Sim",
    concorda_orientacoes_regras_seguranca: respostas[14] === "Sim",

    // Motivação
    motivacao_interesse: respostas[15] || "",
  };
}

// ==========================================================
// FINALIZAÇÃO (envio + tratamento de erro)
// ==========================================================

async function finalizar() {
  const payload = montarPayload();
  const API_URL = `${url}/inscricao-trabalho-voluntario`;

  // Bloqueia duplo envio
  proximo.disabled = true;
  const textoBotao = proximo.textContent;
  proximo.textContent = "Enviando…";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 🔑 Lê o body ANTES de checar .ok (o backend manda {erro: "..."} nos 4xx)
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Tenta extrair mensagem de vários formatos comuns
      const msgBackend =
        data.erro ||
        data.error ||
        data.mensagem ||
        data.message ||
        `Erro ${response.status}: ${response.statusText}`;

      console.error("❌ Backend respondeu erro:", response.status, data);
      avisar(msgBackend, "erro");
      return; // não mostra tela de sucesso
    }

    // Sucesso
    console.log("✅ Enviado com sucesso:", data);

    encerrar(
      "Obrigado! 🐾",
      data.mensagem ||
        "Sua inscrição foi preenchida com sucesso. Nossa equipe analisará suas respostas e entrará em contato em breve.",
    );
  } catch (error) {
    // Erro de rede, timeout, ou falha antes da resposta chegar
    console.error("❌ Erro ao enviar:", error);
    avisar(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
      "erro",
    );
  } finally {
    // Restaura o botão caso o usuário volte (não bloqueia tela de sucesso)
    proximo.disabled = false;
    proximo.textContent = textoBotao;
  }
}

function encerrar(titulo, mensagem) {
  document.querySelector(".formulario").innerHTML = `
        <div class="bloco">
            <h2>${titulo}</h2>
            <p class="mensagem-final">${mensagem}</p>
        </div>
    `;
}

// ==========================================================
// EVENTOS
// ==========================================================

proximo.addEventListener("click", async () => {
  const p = perguntas[indice];
  const valor = obterResposta(p);

  if (valor === null) return;

  if (valor === "" || (Array.isArray(valor) && valor.length === 0)) {
    avisar("Por favor, responda à pergunta antes de continuar.");
    return;
  }

  if (!validarResposta(p, valor)) return;

  respostas[p.id] = valor;

  if (p.eliminar && p.eliminar(valor)) {
    encerrar(
      "Inscrição encerrada",
      "Infelizmente, sua resposta não atende aos critérios obrigatórios para participar desta oportunidade de trabalho voluntário.",
    );
    return;
  }

  if (indice < perguntas.length - 1) {
    indice++;
    desenhar();
  } else {
    await finalizar();
  }
});

voltar.addEventListener("click", () => {
  if (indice > 0) {
    indice--;
    desenhar();
  }
});

desenhar();
