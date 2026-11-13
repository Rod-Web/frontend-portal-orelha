// ./scripts/forms-questions/solicitacao-trabalho-voluntario.js

export const perguntas = [
  {
    id: 1,
    texto: "Qual é o seu nome completo?",
    tipo: "text",
  },

  {
    id: 2,
    texto: "Qual é a sua idade?",
    tipo: "number",
    eliminar: (v) => Number(v) < 18,
  },

  {
    id: 3,
    texto: "Qual é o seu endereço de e-mail?",
    tipo: "email",
  },

  {
    id: 4,
    texto: "Em qual cidade e bairro você reside?",
    tipo: "text",
  },

  {
    id: 5,
    texto: "Qual é o seu telefone para contato?",
    tipo: "tel",
  },

  {
    id: 6,
    texto: "Qual é a sua profissão ou ocupação atual?",
    tipo: "text",
  },

  {
    id: 7,
    texto:
      "Em quais dias da semana você tem disponibilidade para participar das atividades previstas nesta oportunidade?",
    tipo: "checks",
    opcoes: [
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
      "Domingo",
    ],
  },

  {
    id: 8,
    texto: "Em quais períodos você tem disponibilidade?",
    tipo: "checks",
    opcoes: ["Manhã", "Tarde", "Noite"],
  },

  {
    id: 9,
    texto:
      "Caso esta oportunidade tenha um período de duração definido, você tem disponibilidade para participar durante todo esse período?",
    tipo: "radio",
    opcoes: ["Sim", "Não"],
    eliminar: (v) => v === "Não",
  },

  {
    id: 10,
    texto:
      "Você já realizou algum trabalho voluntário anteriormente? Se sim, conte brevemente como foi essa experiência.",
    tipo: "text",
  },

  {
    id: 11,
    texto:
      "Você possui alguma experiência ou habilidade que possa contribuir diretamente para as atividades descritas nesta oportunidade?",
    tipo: "text",
  },

  {
    id: 12,
    texto:
      "Caso seja relevante para as atividades desta oportunidade, você possui experiência ou contato prévio com animais?",
    tipo: "text",
  },

  {
    id: 13,
    texto:
      "Você leu e está ciente das atividades e responsabilidades descritas nesta oportunidade de trabalho voluntário?",
    tipo: "radio",
    opcoes: ["Sim", "Não"],
    eliminar: (v) => v === "Não",
  },

  {
    id: 14,
    texto:
      "Você concorda em seguir as orientações dos responsáveis pela ONG e respeitar as regras e os protocolos de segurança aplicáveis às atividades que realizará?",
    tipo: "radio",
    opcoes: ["Sim", "Não"],
    eliminar: (v) => v === "Não",
  },

  {
    id: 15,
    texto:
      "Por que você se interessou por esta oportunidade de trabalho voluntário?",
    tipo: "textarea",
  },
];
