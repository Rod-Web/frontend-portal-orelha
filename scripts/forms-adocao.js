// ./scripts/forms-adocao.js

import { perguntas } from "./forms-questions/solicitacao-adocao.js";

let indice = 0;
const respostas = {};

const area = document.getElementById("pergunta");
const contador = document.getElementById("contador");
const progresso = document.getElementById("progresso");
const voltar = document.getElementById("voltar");
const proximo = document.getElementById("proximo");

// URL oficial de busca de CEP dos Correios
const URL_CORREIOS =
  "https://buscacepinter.correios.com.br/app/endereco/index.php";

// ─────────────────────────────────────────────────────────────
// 🐾 ID do pet que veio da página de detalhes
// Aceita ?pet=..., ?id=... ou ?petId=...
// ─────────────────────────────────────────────────────────────
const PET_ID = (() => {
  const params = new URLSearchParams(location.search);
  const raw = params.get("pet") || params.get("id") || params.get("petId");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
})();

function listaVisivel() {
  // 🔑 passa `respostas` como argumento para as condicoes
  return perguntas.filter((p) => !p.condicao || p.condicao(respostas));
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

/**
 * Exibe uma caixa de aviso centralizada no topo da tela.
 * @param {string} mensagem - texto a exibir
 * @param {"aviso"|"erro"|"sucesso"} tipo - estilo visual
 */
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

function campoTexto(
  id,
  rotulo,
  placeholder = "",
  valor = "",
  tipo = "text",
  largo = false,
) {
  return `
        <div class="campo-grupo ${largo ? "largo" : ""}">
            <label for="${id}">${rotulo}</label>
            <input
                id="${id}"
                type="${tipo}"
                placeholder="${placeholder}"
                value="${escapar(valor)}"
                ${tipo === "number" ? 'min="0"' : ""}
            >
        </div>
    `;
}

function desenharEndereco(endereco = {}) {
  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return `
        <p class="instrucao">
            Preencha os dados do local onde o animal vai morar.
        </p>

        <div class="campos">
            ${campoTexto("rua", "Rua / Avenida", "Nome da rua", endereco.rua, "text", true)}
            ${campoTexto("numero", "Número", "Nº da residência", endereco.numero)}
            ${campoTexto("complemento", "Complemento (opcional)", "Casa, apartamento...", endereco.complemento)}
            ${campoTexto("bairro", "Bairro", "Seu bairro", endereco.bairro)}
            ${campoTexto("cidade", "Cidade", "Sua cidade", endereco.cidade)}

            <div class="campo-grupo">
                <label for="uf">Estado</label>
                <select id="uf">
                    <option value="">Selecione</option>
                    ${estados
                      .map(
                        (uf) => `
                        <option value="${uf}" ${endereco.uf === uf ? "selected" : ""}>
                            ${uf}
                        </option>
                    `,
                      )
                      .join("")}
                </select>
            </div>
        </div>
    `;
}

function desenhar() {
  const lista = listaVisivel();

  indice = Math.max(0, Math.min(indice, lista.length - 1));

  const p = lista[indice];

  contador.textContent = `PERGUNTA ${indice + 1} DE ${lista.length}`;
  progresso.style.width = `${((indice + 1) / lista.length) * 100}%`;

  voltar.disabled = indice === 0;

  proximo.textContent =
    indice === lista.length - 1 ? "Finalizar →" : "Próximo →";

  let campo = "";

  if (p.tipo === "endereco") {
    campo = desenharEndereco(respostas[4]);
  } else if (p.tipo === "cep") {
    campo = `
            <p class="instrucao">
                Digite seu CEP. Se não souber, consulte no site dos Correios.
            </p>

            <div class="campo-grupo">
                <label for="campo">CEP</label>
                <input
                    id="campo"
                    type="text"
                    inputmode="numeric"
                    placeholder="00000-000"
                    maxlength="9"
                    value="${escapar(respostas[5])}"
                >
            </div>

            <div class="cep-acoes">
                <a
                    href="${URL_CORREIOS}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="botao-consulta"
                >
                    <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
                    Não sei meu CEP — abrir site dos Correios
                </a>
            </div>
        `;
  } else if (p.tipo === "checks") {
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

            ${
              p.semComplemento
                ? ""
                : `
                <div class="campo-grupo" style="margin-top: 18px;">
                    <label for="complemento-resposta">
                        Quer acrescentar algum detalhe? (opcional)
                    </label>
                    <textarea
                        id="complemento-resposta"
                        placeholder="Escreva aqui..."
                    >${escapar(respostas[p.id + "_extra"])}</textarea>
                </div>
            `
            }
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

  if (p.tipo === "cep") {
    configurarMascaraCep();
  }

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

function lerEndereco() {
  return {
    rua: document.getElementById("rua").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    complemento: document.getElementById("complemento").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    uf: document.getElementById("uf").value,
  };
}

/**
 * Aplica apenas a máscara visual 00000-000 no campo de CEP.
 * Não faz nenhuma requisição externa.
 */
function configurarMascaraCep() {
  const input = document.getElementById("campo");
  if (!input) return;

  input.addEventListener("input", () => {
    let numeros = input.value.replace(/\D/g, "").slice(0, 8);

    if (numeros.length > 5) {
      numeros = numeros.slice(0, 5) + "-" + numeros.slice(5);
    }

    input.value = numeros;
  });
}

function obterResposta(p) {
  if (p.tipo === "endereco") {
    const endereco = lerEndereco();

    if (
      !endereco.rua ||
      !endereco.numero ||
      !endereco.bairro ||
      !endereco.cidade ||
      !endereco.uf
    ) {
      avisar(
        "Preencha rua, número, bairro, cidade e estado. O complemento é opcional.",
      );
      return null;
    }

    return endereco;
  }

  if (p.tipo === "checks") {
    const selecionadas = [
      ...document.querySelectorAll('input[name="resposta-multipla"]:checked'),
    ].map((input) => input.value);

    // (preventivo) caso algum dia adicionemos checks "só sim"
    if (p.semComplemento) {
      if (selecionadas.length === 0) {
        avisar("Para prosseguir, você precisa confirmar esta declaração.");
        return null;
      }
      return selecionadas;
    }

    const complemento = document
      .getElementById("complemento-resposta")
      .value.trim();

    if (selecionadas.length === 0 && !complemento) {
      avisar("Selecione pelo menos uma opção ou escreva uma resposta.");
      return null;
    }

    respostas[p.id + "_extra"] = complemento;

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

  cep(valor) {
    const d = String(valor).replace(/\D/g, "");
    if (!/^\d{8}$/.test(d)) return "CEP deve conter 8 números.";
    return null;
  },

  quantidadePessoas(valor) {
    const n = Number(valor);
    if (!Number.isFinite(n) || n < 0) return "Digite um número válido.";
    if (n > 50) return "Número de pessoas inválido.";
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
  if (p.id === 5) {
    const err = validacoes.cep(valor);
    if (err) {
      avisar(err, "erro");
      return false;
    }
  }
  if (p.id === 15) {
    const err = validacoes.quantidadePessoas(valor);
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
 * Converte o objeto bruto `respostas` (IDs 1–21) no formato
 * exato da tabela `solicitacao_adocao`.
 *
 * Campos gerenciados pelo backend (NÃO incluídos aqui):
 *   - id (AUTO_INCREMENT)
 *   - data_solicitacao (DEFAULT CURRENT_TIMESTAMP)
 *   - status (DEFAULT 'PENDENTE')
 */
function montarPayload() {
  // ─── Q4: endereço estruturado → string única ─────────────
  const end = respostas[4] || {};
  const partes = [
    end.rua,
    end.numero,
    end.complemento,
    end.bairro,
    `${end.cidade}/${end.uf}`,
  ].filter((p) => p && String(p).trim() !== "");
  const enderecoCompleto = partes.join(", ");

  // ─── Q9: array de cômodos → string ───────────────────────
  const comodos = Array.isArray(respostas[9]) ? respostas[9] : [];
  const comodosExtra = (respostas["9_extra"] || "").trim();
  let comodosStr = comodos.join(", ");
  if (comodosExtra) {
    comodosStr = comodosStr
      ? `${comodosStr}. Outros: ${comodosExtra}`
      : `Outros: ${comodosExtra}`;
  }

  // ─── Q10 / Q18: Sim/Não → boolean ────────────────────────
  const possuiOutrosAnimais = respostas[10] === "Sim";
  const animaisAnteriores = respostas[18] === "Sim";

  // ─── Q16 / Q21: sempre true (eliminatórias) ──────────────
  const familiaCiente = String(respostas[16] || "").startsWith("Sim");
  const compromisso = String(respostas[21] || "").startsWith("Sim");

  // ─── Payload final ───────────────────────────────────────
  return {
    id_pet: PET_ID,

    // Adotante
    nome_completo: respostas[1] || "",
    idade: parseInt(respostas[2], 10),
    email: respostas[3] || "",
    endereco_completo: enderecoCompleto,
    cep: String(respostas[5] || "").replace(/\D/g, ""),
    telefone_contato: String(respostas[6] || "").replace(/\D/g, ""),
    profissao: respostas[7] || "",

    // Residência
    medidas_seguranca_residencial: respostas[8] || "",
    comodos_acesso_animal: comodosStr,
    quantidade_pessoas_residencia: parseInt(respostas[15], 10),
    familia_ciente_concorda: familiaCiente,
    crianca_convivio: respostas[17] || "",

    // Animais atuais (condicional à Q10)
    possui_outros_animais: possuiOutrosAnimais,
    descricao_animais_existentes: possuiOutrosAnimais
      ? respostas[11] || ""
      : null,
    racao_atual: possuiOutrosAnimais ? respostas[12] || "" : null,
    veterinario_responsavel: possuiOutrosAnimais ? respostas[13] || "" : null,

    // Cuidados
    cuidador_direto: respostas[14] || "",
    rotina_familiar: respostas[20] || "",

    // Histórico (condicional à Q18)
    animais_anteriores: animaisAnteriores,
    descricao_animais_anteriores: animaisAnteriores
      ? respostas[19] || ""
      : null,

    // Compromisso
    compromisso_adocao_responsavel: compromisso,
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
  //     const response = await fetch("https://SEU-BACKEND/api/solicitacoes", {
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
  //     avisar("Não foi possível enviar o formulário. Tente novamente.", "erro");
  //     return;
  // }
  // ==========================================================

  encerrar(
    "Obrigado! 🐾",
    "Seu formulário foi preenchido com sucesso. Entraremos em contato em breve.",
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
  const lista = listaVisivel();
  const p = lista[indice];
  const valor = obterResposta(p);

  if (valor === null) return;

  if (
    valor === "" ||
    (Array.isArray(valor) && valor.length === 0 && !respostas[p.id + "_extra"])
  ) {
    avisar("Por favor, responda à pergunta antes de continuar.");
    return;
  }

  if (!validarResposta(p, valor)) return;

  if (p.id === 5) {
    const cep = String(valor).replace(/\D/g, "");
    respostas[5] = cep;

    if (!respostas[4] || respostas[4].uf !== "SP") {
      
      encerrar(
        "Formulário encerrado",
        "No momento, o processo de adoção atende apenas candidatos residentes no estado de São Paulo.",
      );
      return;
    }
  }

  respostas[p.id] = valor;

  if (p.eliminar && p.eliminar(valor)) {
    
    encerrar(
      "Formulário encerrado",
      "Infelizmente, sua resposta não atende aos critérios obrigatórios para continuar o processo de adoção.",
    );
    return;
  }

  const novaLista = listaVisivel();

  if (indice < novaLista.length - 1) {
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
