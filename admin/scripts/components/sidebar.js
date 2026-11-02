// ./admin/scripts/components/sidebar.js

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    const aberto = sidebar.classList.toggle("aberta");
    menuToggle.setAttribute("aria-expanded", aberto);
  });
}
