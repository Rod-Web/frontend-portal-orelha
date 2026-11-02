// modal-aviso.js
const modal = document.getElementById("modalAviso");
const texto = document.getElementById("modalAvisoTexto");
const botaoOk = document.getElementById("modalAvisoOk");

let urlRedirecionar = null;
let elementoFocadoAntes = null;


export function mostrarAviso(mensagem, url = null, titulo = "Aviso") {
  texto.textContent = mensagem;
  document.getElementById("modalAvisoTitulo").textContent = titulo;
  urlRedirecionar = url;

  elementoFocadoAntes = document.activeElement;
  modal.hidden = false;

  // Foca o botão OK (acessibilidade)
  botaoOk.focus();
}

function fecharModal() {
  modal.hidden = true;
  urlRedirecionar = null;
  elementoFocadoAntes?.focus?.();
}

// Botão OK
botaoOk.addEventListener("click", function () {
  const destino = urlRedirecionar;
  fecharModal();
  if (destino) window.location.replace(destino);
});

// ESC fecha o modal
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !modal.hidden) {
    fecharModal();
  }
});
