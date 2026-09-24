const pets = [

    {
        nome: "Hércules",
        idade: "2 anos",
        raca: "SRD",
        sexo: "Masculino",
        personalidade: "Brincalhão",
        porte: "Grande",
        imagem: "../img/dogUm.png"
    },

    {
        nome: "Mingau",
        idade: "3 anos",
        raca: "SRD",
        sexo: "Masculino",
        personalidade: "Carinhoso",
        porte: "Médio",
        imagem: "../img/catUm.png"
    },

    {
        nome: "Nala",
        idade: "2 anos",
        raca: "SRD",
        sexo: "Feminino",
        personalidade: "Tranquila",
        porte: "Pequeno",
        imagem: "../img/catD.png"
    },

    {
        nome: "Theo",
        idade: "4 anos",
        raca: "SRD",
        sexo: "Masculino",
        personalidade: "Dócil",
        porte: "Grande",
        imagem: "../img/dogD.png"
    },

    {
        nome: "Luna",
        idade: "1 ano",
        raca: "SRD",
        sexo: "Feminino",
        personalidade: "Carinhosa",
        porte: "Pequeno",
        imagem: "../img/catT.png"
    },

    {
        nome: "Toby",
        idade: "3 anos",
        raca: "SRD",
        sexo: "Masculino",
        personalidade: "Brincalhão",
        porte: "Médio",
        imagem: "../img/dogT.png"
    }

];


let petAtual = Number(localStorage.getItem("petSelecionado")) || 0;


const nomePet = document.getElementById("nomePet");
const idadePet = document.getElementById("idadePet");
const racaPet = document.getElementById("racaPet");

const sexoPet = document.getElementById("sexoPet");
const personalidadePet = document.getElementById("personalidadePet");
const portePet = document.getElementById("portePet");

const imagemPet = document.getElementById("imagemPet");

const informacaoContainer =
    document.querySelector(".informacao-container");


function mostrarPet() {

    const pet = pets[petAtual];

    nomePet.textContent = pet.nome;
    idadePet.textContent = pet.idade;
    racaPet.textContent = pet.raca;

    sexoPet.textContent = pet.sexo;
    personalidadePet.textContent = pet.personalidade;
    portePet.textContent = pet.porte;

    imagemPet.src = pet.imagem;
    imagemPet.alt = pet.nome;
}


/* PRIMEIRO PET */

mostrarPet();












/* PRÓXIMO */

document.getElementById("proximo").addEventListener("click", function () {

    informacaoContainer.classList.add("saindo-esquerda");

    setTimeout(function () {

        petAtual++;

        if (petAtual >= pets.length) {
            petAtual = 0;
        }

        mostrarPet();

        informacaoContainer.classList.remove("saindo-esquerda");

        informacaoContainer.classList.add("entrando-direita");

        setTimeout(function () {
            informacaoContainer.classList.remove("entrando-direita");
        }, 350);

    }, 350);

});


/* VOLTAR */

document.getElementById("voltar").addEventListener("click", function () {

    informacaoContainer.classList.add("saindo-direita");

    setTimeout(function () {

        petAtual--;

        if (petAtual < 0) {
            petAtual = pets.length - 1;
        }

        mostrarPet();

        informacaoContainer.classList.remove("saindo-direita");

        informacaoContainer.classList.add("entrando-esquerda");

        setTimeout(function () {
            informacaoContainer.classList.remove("entrando-esquerda");
        }, 350);

    }, 350);

});