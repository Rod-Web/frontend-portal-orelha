function abrirFiltro() {
    const opcoes = document.getElementById("opcoes");

    if (opcoes.style.display === "block") {
        opcoes.style.display = "none";
    } else {
        opcoes.style.display = "block";
    }
}


function selecionarFiltro(tipo) {

    document.getElementById("textoFiltro").textContent = tipo;
    document.getElementById("opcoes").style.display = "none";

    const cachorros = document.querySelectorAll(".cachorro");
    const gatos = document.querySelectorAll(".gato");

    if (tipo === "Cachorro") {
        cachorros.forEach(card => card.style.display = "block");
        gatos.forEach(card => card.style.display = "none");
    }

    if (tipo === "Gato") {
        cachorros.forEach(card => card.style.display = "none");
        gatos.forEach(card => card.style.display = "block");
    }

    if (tipo === "Todos") {
        cachorros.forEach(card => card.style.display = "block");
        gatos.forEach(card => card.style.display = "block");
    }
}

function abrirPet(indice) {
    localStorage.setItem("petSelecionado", indice);
    window.location.href = "./informacao_pets.html";
}