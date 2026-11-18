const botaoCopiar = document.getElementById("botaoCopiar");
const aviso = document.getElementById("avisoCopia");

if (botaoCopiar) {
  botaoCopiar.addEventListener("click", async () => {
    const alvo = document.querySelector(botaoCopiar.dataset.copiar);
    const texto = alvo ? alvo.textContent.trim() : "";
    const rotulo = botaoCopiar.querySelector("span");

    try {
      await navigator.clipboard.writeText(texto);
      aviso.textContent = "Chave Pix copiada! Obrigado por ajudar. 💛";
      rotulo.textContent = "Copiado!";
    } catch (erro) {
      aviso.textContent =
        "Não foi possível copiar. Selecione a chave e copie manualmente.";
    }

    setTimeout(() => {
      rotulo.textContent = "Copiar";
      aviso.textContent = "";
    }, 3000);
  });
}
