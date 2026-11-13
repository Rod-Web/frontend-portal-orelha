const filtros = document.querySelectorAll(".filtro");
const noticias = document.querySelectorAll(".noticia-card");
const aviso = document.querySelector(".aviso-filtro");
filtros.forEach((filtro) => {
  filtro.addEventListener("click", () => {
    // Remove a seleção anterior
    filtros.forEach((botao) => {
      botao.classList.remove("ativo");
    });

    // Ativa o botão selecionado
    filtro.classList.add("ativo");

    const categoria = filtro.dataset.categoria;

    let quantidadeVisivel = 0;

    noticias.forEach((noticia) => {
      const categorias = noticia.dataset.categoria.split(" ");

      const corresponde =
        categoria === "todas" || categorias.includes(categoria);

      noticia.style.display = corresponde ? "flex" : "none";

      if (corresponde) {
        quantidadeVisivel++;
      }
    });

    // Mostra aviso caso não existam notícias
    if (aviso) {
      aviso.hidden = quantidadeVisivel > 0;
    }
  });
});
