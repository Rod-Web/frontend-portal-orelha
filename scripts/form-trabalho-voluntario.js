// ./scripts/forms-trabalho-voluntario.js

import { perguntas } from "./forms-questions/solicitacao-trabalho-voluntario.js";

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
};

function validarResposta(p, valor) {
  if (p.id === 1 && typeof valor === "string") {
    const err = validacoes.nome(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }
  if (p.id === 2) {
    const err = validacoes.idade(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }
  if (p.tipo === "email" && typeof valor === "string") {
    const err = validacoes.email(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }
  if (p.tipo === "tel" && typeof valor === "string") {
    const err = validacoes.tel(valor);
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

/**
 * Converte o objeto bruto `respostas` (IDs 1–15) no formato
 * ideal para a tabela `inscricao_trabalho_voluntario`.
 *
 * Campos gerenciados pelo backend (NÃO incluídos aqui):
 *   - id (AUTO_INCREMENT)
 *   - data_inscricao (DEFAULT CURRENT_TIMESTAMP)
 *   - status (DEFAULT 'PENDENTE')
 */
function montarPayload() {
  const dias = Array.isArray(respostas[7]) ? respostas[7] : [];
  const periodos = Array.isArray(respostas[8]) ? respostas[8] : [];

  return {
    id_trabalho_voluntario: TRABALHO_ID,

    // Dados pessoais
    nome_completo: respostas[1] || "",
    idade: parseInt(respostas[2], 10),
    email: respostas[3] || "",
    cidade_bairro: respostas[4] || "",
    telefone_contato: String(respostas[5] || "").replace(/\D/g, ""),
    profissao: respostas[6] || "",

    // Disponibilidade
    dias_disponiveis: dias.join(", "),
    periodos_disponiveis: periodos.join(", "),
    disponibilidade_integral: respostas[9] === "Sim",

    // Experiência
    experiencia_voluntariado: respostas[10] || "",
    habilidades_contribuicao: respostas[11] || "",
    experiencia_animais: respostas[12] || "",

    // Compromisso
    ciente_atividades: respostas[13] === "Sim",
    concorda_orientacoes: respostas[14] === "Sim",

    // Motivação
    motivacao: respostas[15] || "",
  };
}

// ==========================================================
// LOG + FINALIZAÇÃO
// ==========================================================



async function finalizar() {

  const payload = montarPayload();

  console.group(
    "%c📤 PAYLOAD PRONTO PARA ENVIO",
    "color: #1d6b2b; font-size: 14px; font-weight: bold;",
  );
  console.log("%cPayload:", "color: #666; font-weight: bold;", payload);
  console.log("%cJSON (para copiar):", "color: #666; font-weight: bold;");
  console.log(JSON.stringify(payload, null, 2));
  console.groupEnd();

  // ==========================================================
  // TODO: Enviar via POST quando o backend estiver pronto
  // ==========================================================
  // try {
  //     const response = await fetch("https://SEU-BACKEND/api/inscricoes-voluntario", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload)
  //     });
  //
  //     if (!response.ok) {
  //         throw new Error(`HTTP ${response.status} — ${response.statusText}`);
  //     }
  //
  //     const data = await response.json().catch(() => ({}));
  //     console.log("✅ Enviado com sucesso:", data);
  // } catch (error) {
  //     console.error("❌ Erro ao enviar:", error);
  //     avisar("Não foi possível enviar sua inscrição. Tente novamente.", "erro");
  //     return;
  // }
  // ==========================================================

  encerrar(
    "Obrigado! 🐾",
    "Sua inscrição foi preenchida com sucesso. Nossa equipe analisará suas respostas e entrará em contato em breve.",
  );
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
