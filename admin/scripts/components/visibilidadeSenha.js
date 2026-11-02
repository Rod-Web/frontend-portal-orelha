const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", function () {
  const visivel = senhaInput.type === "text";

  // Alterna o tipo do input
  senhaInput.type = visivel ? "password" : "text";

  // Troca o ícone
  const icone = toggleSenha.querySelector("i");
  icone.classList.toggle("fa-eye");
  icone.classList.toggle("fa-eye-slash");

  // Atualiza o aria-label pra acessibilidade
  toggleSenha.setAttribute(
    "aria-label",
    visivel ? "Mostrar senha" : "Ocultar senha",
  );
});
