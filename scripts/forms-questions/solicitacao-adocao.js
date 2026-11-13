// ./scripts/forms-questuions/solicitacao-adocao.js

export const perguntas = [
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
    { id: 6, texto: "Qual é o seu telefone?", tipo: "tel" },
    { id: 7, texto: "Qual é a sua profissão?", tipo: "text" },

    {
        id: 8,
        texto: "A residência possui telas de proteção, muros, portões ou outras medidas de segurança adequadas para evitar fugas e acidentes? Se sim, quais?",
        tipo: "text"
    },

    {
        id: 9,
        texto: "A quais cômodos da casa o animal terá acesso?",
        tipo: "checks",
        opcoes: [
            "Sala", "Quartos", "Cozinha", "Banheiro", "Quintal", "Toda a casa", "Outros"
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
        texto: "Quais animais você possui? Informe a espécie, a quantidade, a idade e, se possível, o temperamento de cada um.",
        tipo: "text",
        condicao: (r) => r[10] === "Sim"
    },

    {
        id: 12,
        texto: "Qual é a marca e o tipo de ração que seus animais consomem atualmente?",
        tipo: "text",
        condicao: (r) => r[10] === "Sim"
    },

    {
        id: 13,
        texto: "Qual clínica veterinária ou profissional veterinário acompanha seus animais?",
        tipo: "text",
        condicao: (r) => r[10] === "Sim"
    },

    {
        id: 14,
        texto: "Você será o responsável direto pelos cuidados do animal adotado? Se não, quem será o responsável?",
        tipo: "text"
    },

    {
        id: 15,
        texto: "Quantas pessoas moram com você?",
        tipo: "number"
    },

    {
        id: 16,
        texto: "Caso você more com seus pais ou com outras pessoas, todos estão cientes da adoção e concordam em receber um novo animal na residência?",
        tipo: "radio",
        opcoes: [
            "Sim, todos estão cientes e concordam",
            "Não, nem todos concordam ou não estão cientes"
        ],
        eliminar: v => String(v).startsWith("Não")
    },

    {
        id: 17,
        texto: "Existem crianças na residência ou em seu convívio frequente? Se sim, qual é a idade delas e como será a convivência com o animal?",
        tipo: "text"
    },

    {
        id: 18,
        texto: "Você já teve outros animais anteriormente?",
        tipo: "radio",
        opcoes: ["Sim", "Não"]
    },

    {
        id: 19,
        texto: "Se sim, quantos animais você já teve e o que aconteceu com cada um deles?",
        tipo: "text",
        condicao: (r) => r[18] === "Sim"
    },

    {
        id: 20,
        texto: "Como é a rotina diária da sua família? Por quanto tempo o animal ficará sozinho em casa?",
        tipo: "text"
    },

    {
        id: 21,
        texto: "Você tem ciência de todos os custos que cães e gatos podem gerar ao longo da vida, incluindo alimentação, despesas veterinárias, higiene e limpeza, e confirma que possui condições de arcar com esses custos? Você compreende que a adoção não deve ser uma decisão por impulso e que assumir um animal significa comprometer-se com seu bem-estar e seus cuidados durante toda a vida dele?",
        tipo: "radio",
        opcoes: [
            "Sim, estou ciente e comprometido(a)",
            "Não, não tenho condições ou não me comprometo"
        ],
        eliminar: v => String(v).startsWith("Não")
    }
];