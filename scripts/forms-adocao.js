
const perguntas = [
    { id: 1, texto: "Qual é o seu nome completo?", tipo: "text" },

    {
        id: 2,
        texto: "Quantos anos você tem?",
        tipo: "number",
        eliminar: v => Number(v) < 18
    },

    { id: 3, texto: "Qual é o seu e-mail?", tipo: "email" },

    { id: 4, texto: "Onde você mora?", tipo: "endereco" },

    { id: 5, texto: "Qual é o seu CEP?", tipo: "cep" },

    {
        id: 6,
        texto: "Qual é o seu telefone?",
        tipo: "tel"
    }, 

    { id: 7, texto: "Qual é a sua profissão?", tipo: "text" },

    {
        id: 8,
        texto: "Quais medidas de segurança existem na sua casa?",
        tipo: "checks",
        opcoes: [
            "Telas nas janelas",
            "Portões seguros",
            "Muros ou cercas",
            "Portas protegidas",
            "Quintal fechado",
            "Ainda preciso fazer adaptações",
            "Outros"
        ]
    },

    {
        id: 9,
        texto: "A quais cômodos da casa o animal terá acesso?",
        tipo: "checks",
        opcoes: [
            "Sala",
            "Quartos",
            "Cozinha",
            "Banheiro",
            "Quintal",
            "Toda a casa",
            "Outros"
        ]
    },

    {
        id: 10,
        texto: "Você possui outros animais?",
        tipo: "radio",
        opcoes: ["Sim", "Não"]
    },

    {
        id: 11,
        texto: "Quem será o principal responsável pelos cuidados do animal?",
        tipo: "radio",
        opcoes: [
            "Eu",
            "Eu e outra pessoa",
            "Outro morador da casa",
            "Um familiar que não mora comigo"
        ]
    },

    {
        id: 12,
        texto: "Qual alimento você oferece aos seus animais atualmente?",
        tipo: "text",
        condicao: () => respostas[10] === "Sim"
    },

    {
        id: 13,
        texto: "Qual clínica veterinária ou profissional atende seus animais?",
        tipo: "text",
        condicao: () => respostas[10] === "Sim"
    },

    {
        id: 14,
        texto: "Você será a pessoa responsável pelos cuidados diários do animal?",
        tipo: "radio",
        opcoes: ["Sim", "Não"]
    },

    {
    id: 15,
    texto: "Há crianças na sua casa ou que frequentam o ambiente?",
    tipo: "radio",
    opcoes: [
        "Sim, moram comigo",
        "Sim, frequentam a casa",
        "Sim, ambas as situações",
        "Não"
    ]
    },
    {
        id: 16,
        texto: "Como é a rotina da sua família durante o dia?",
        tipo: "radio",
        opcoes: [
            "Fico em casa a maior parte do dia",
            "Trabalho ou estudo fora",
            "Tenho uma rotina alternada",
            "A casa fica vazia durante algumas horas",
            "A casa fica vazia durante a maior parte do dia"
        ]
    },
    {
        id: 17,
        texto: "Por quantas horas o animal ficará sozinho por dia?",
        tipo: "radio",
        opcoes: [
            "Quase nunca",
            "De 1 a 3 horas",
            "De 4 a 6 horas",
            "De 7 a 8 horas",
            "Mais de 8 horas"
        ]
    },
    {
        id: 18,
        texto: "Você está ciente dos custos e comprometido(a) com os cuidados do animal por toda a vida dele?",
        tipo: "radio",
        opcoes: [
            "Sim, estou ciente e comprometido(a)",
            "Tenho dúvidas sobre os custos e cuidados"
        ]
    },

    {
        id: 19,
        texto: "Quais são as idades das crianças e como será a convivência com o animal?",
        tipo: "textarea",
        condicao: () => respostas[18] === "Sim"
    },

    {
        id: 20,
        texto: "Você já teve animais antes?",
        tipo: "radio",
        opcoes: [
            "Sim, e tenho animais atualmente",
            "Sim, mas não tenho mais",
            "Não, será minha primeira experiência"
            ]
    },

    {
        id: 21,
        texto: "Você está ciente dos gastos e assume o compromisso de cuidar do animal por toda a vida dele?",
        tipo: "radio",
        opcoes: ["Sim", "Não"],
        eliminar: v => v === "Não"
    }
];

let indice = 0;
const respostas = {};

const area = document.getElementById("pergunta");
const contador = document.getElementById("contador");
const progresso = document.getElementById("progresso");
const voltar = document.getElementById("voltar");
const proximo = document.getElementById("proximo");

function listaVisivel() {
    return perguntas.filter(p => !p.condicao || p.condicao());
}

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function campoTexto(id, rotulo, placeholder = "", valor = "", tipo = "text", largo = false) {
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
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES",
        "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
        "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
        "SP", "SE", "TO"
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
                    ${estados.map(uf => `
                        <option value="${uf}" ${endereco.uf === uf ? "selected" : ""}>
                            ${uf}
                        </option>
                    `).join("")}
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
    }

    else if (p.tipo === "cep") {
        campo = `
            <p class="instrucao">
                Digite seu CEP ou procure pelo endereço que você informou.
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
                <button type="button" class="botao-consulta" id="buscar-cep">
                    Não sei meu CEP — procurar
                </button>
            </div>

            <div id="resultado-cep" aria-live="polite"></div>
        `;
    }

    

    else if (p.tipo === "checks") {
        const selecionadas = respostas[p.id] || [];

        campo = `
            <p class="instrucao">
                Selecione todas as opções que se aplicam.
            </p>

            <div class="opcoes-multiplas">
                ${p.opcoes.map(op => `
                    <label>
                        <input
                            type="checkbox"
                            name="resposta-multipla"
                            value="${escapar(op)}"
                            ${selecionadas.includes(op) ? "checked" : ""}
                        >
                        ${escapar(op)}
                    </label>
                `).join("")}
            </div>

            <div class="campo-grupo" style="margin-top: 18px;">
                <label for="complemento-resposta">
                    Quer acrescentar algum detalhe? (opcional)
                </label>
                <textarea
                    id="complemento-resposta"
                    placeholder="Escreva aqui..."
                >${escapar(respostas[p.id + "_extra"])}</textarea>
            </div>
        `;
    }

    else if (p.tipo === "radio") {
        campo = `
            <div class="opcoes">
                ${p.opcoes.map(op => `
                    <label>
                        <input
                            type="radio"
                            name="resposta"
                            value="${escapar(op)}"
                            ${respostas[p.id] === op ? "checked" : ""}
                        >
                        ${escapar(op)}
                    </label>
                `).join("")}
            </div>
        `;
    }

    else if (p.tipo === "textarea") {
        campo = `
            <textarea id="campo" placeholder="Escreva sua resposta...">${escapar(respostas[p.id])}</textarea>
        `;
    }

    else {
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
        configurarBuscaCep();
    }

    if (p.tipo === "tel") {
        const telefone = document.getElementById("campo");

        telefone.placeholder = "(11) 99999-9999";
        telefone.maxLength = 15;
        telefone.inputMode = "numeric";

        telefone.addEventListener("input", () => {
            let numeros = telefone.value.replace(/\D/g, "").slice(0, 11);

            if (numeros.length > 10) {
                numeros = numeros.replace(
                    /^(\d{2})(\d{5})(\d{4})$/,
                    "($1) $2-$3"
                );
            } else if (numeros.length > 6) {
                numeros = numeros.replace(
                    /^(\d{2})(\d{4})(\d{0,4})$/,
                    "($1) $2-$3"
                );
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
        uf: document.getElementById("uf").value
    };
}

function configurarBuscaCep() {
    const input = document.getElementById("campo");
    const botao = document.getElementById("buscar-cep");
    const resultado = document.getElementById("resultado-cep");

    input.addEventListener("input", () => {
        let numeros = input.value.replace(/\D/g, "").slice(0, 8);

        if (numeros.length > 5) {
            numeros = numeros.slice(0, 5) + "-" + numeros.slice(5);
        }

        input.value = numeros;
    });

    botao.addEventListener("click", async () => {
        const endereco = respostas[4];

        if (!endereco || !endereco.rua || !endereco.cidade || !endereco.uf) {
            resultado.textContent =
                "Volte ao endereço e preencha rua, cidade e estado para procurar.";
            return;
        }

        resultado.textContent = "Procurando CEP...";
        botao.disabled = true;

        try {
            const url =
                `https://viacep.com.br/ws/${encodeURIComponent(endereco.uf)}/${encodeURIComponent(endereco.cidade)}/${encodeURIComponent(endereco.rua)}/json/`;

            const resposta = await fetch(url);

            if (!resposta.ok) {
                throw new Error("Falha na consulta");
            }

            const dados = await resposta.json();

            if (!Array.isArray(dados) || dados.length === 0) {
                resultado.textContent =
                    "Não encontramos um CEP. Confira o endereço ou consulte os Correios.";
                return;
            }

            resultado.innerHTML = `
                <label for="opcoes-cep">Selecione o endereço correto:</label>

                <select id="opcoes-cep">
                    <option value="">Escolha uma opção</option>
                    ${dados.map((item, i) => `
                        <option value="${i}">
                            ${escapar(item.logradouro || endereco.rua)}
                            — ${escapar(item.bairro || "Bairro não informado")}
                            — ${escapar(item.cep)}
                        </option>
                    `).join("")}
                </select>
            `;

            document.getElementById("opcoes-cep").addEventListener("change", event => {
                if (event.target.value === "") return;

                const escolhido = dados[Number(event.target.value)];

                input.value = escolhido.cep;

                respostas[4] = {
                    ...endereco,
                    rua: escolhido.logradouro || endereco.rua,
                    bairro: escolhido.bairro || endereco.bairro,
                    cidade: escolhido.localidade || endereco.cidade,
                    uf: escolhido.uf || endereco.uf
                };

                resultado.textContent =
                    `CEP encontrado: ${escolhido.cep}. Confira antes de continuar.`;
            });

        } catch {
            resultado.textContent =
                "Não foi possível consultar agora. Confira sua conexão e tente novamente.";
        } finally {
            botao.disabled = false;
        }
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
            alert("Preencha rua, número, bairro, cidade e estado. O complemento é opcional.");
            return null;
        }

        return endereco;
    }

    if (p.tipo === "checks") {
        const selecionadas = [
            ...document.querySelectorAll('input[name="resposta-multipla"]:checked')
        ].map(input => input.value);

        const complemento = document.getElementById("complemento-resposta").value.trim();

        if (selecionadas.length === 0 && !complemento) {
            alert("Selecione pelo menos uma opção ou escreva uma resposta.");
            return null;
        }

        respostas[p.id + "_extra"] = complemento;

        return selecionadas;
    }

    if (p.tipo === "radio") {
        return document.querySelector('input[name="resposta"]:checked')?.value || "";
    }

    return document.getElementById("campo").value.trim();
}

function encerrar(titulo, mensagem) {
    document.querySelector(".formulario").innerHTML = `
        <div class="bloco">
            <h2>${titulo}</h2>
            <p class="mensagem-final">${mensagem}</p>
        </div>
    `;
}

proximo.addEventListener("click", () => {
    const lista = listaVisivel();
    const p = lista[indice];
    const valor = obterResposta(p);

    if (valor === null) return;

    if (valor === "") {
        alert("Por favor, responda à pergunta antes de continuar.");
        return;
    }

    if (
        p.tipo === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    ) {
        alert("Digite um e-mail válido.");
        return;
    }

    if (p.tipo === "number" && Number(valor) < 0) {
        alert("Digite um número válido.");
        return;
    }

    if (p.id === 5) {
        const cep = valor.replace(/\D/g, "");

        if (!/^\d{8}$/.test(cep)) {
            alert("Digite um CEP válido com 8 números.");
            return;
        }

        respostas[5] = cep;

        if (!respostas[4] || respostas[4].uf !== "SP") {
            encerrar(
                "Formulário encerrado",
                "No momento, o processo de adoção atende apenas candidatos residentes no estado de São Paulo."
            );
            return;
        }
    }

    respostas[p.id] = valor;

    if (p.eliminar && p.eliminar(valor)) {
        encerrar(
            "Formulário encerrado",
            "Infelizmente, sua resposta não atende aos critérios obrigatórios para continuar o processo de adoção."
        );
        return;
    }

    const novaLista = listaVisivel();

    if (indice < novaLista.length - 1) {
        indice++;
        desenhar();
    } else {
        encerrar(
            "Obrigado!",
            "Seu formulário foi preenchido com sucesso."
        );
    }
});

voltar.addEventListener("click", () => {
    if (indice > 0) {
        indice--;
        desenhar();
    }
});

desenhar();
