// ./admin/scripts/components/modal-aviso.js

const modal = document.getElementById("modalAviso");
const texto = document.getElementById("modalAvisoTexto");
const tituloEl = document.getElementById("modalAvisoTitulo");
const botaoOk = document.getElementById("modalAvisoOk");

// A página pode não ter o modal — nesse caso, viram no-op
const temModal = !!(modal && texto && tituloEl && botaoOk);

let urlRedirecionar = null;
let elementoFocadoAntes = null;

export function mostrarAviso(mensagem, url = null, titulo = "Aviso") {
  if (!temModal) {
    // Fallback para páginas sem o HTML do modal
    console.warn("[modal-aviso]", `${titulo}:`, mensagem);
    if (url) window.location.replace(url);
    return;
  }

  texto.textContent = mensagem;
  tituloEl.textContent = titulo;
  urlRedirecionar = url;

  elementoFocadoAntes = document.activeElement;
  modal.hidden = false;

  // Foca o botão OK (acessibilidade)
  botaoOk.focus();
}

function fecharModal() {
  if (!temModal) return;
  modal.hidden = true;
  urlRedirecionar = null;
  elementoFocadoAntes?.focus?.();
}

if (temModal) {
  botaoOk.addEventListener("click", function () {
    const destino = urlRedirecionar;
    fecharModal();
    if (destino) window.location.replace(destino);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      fecharModal();
    }
  });
}
