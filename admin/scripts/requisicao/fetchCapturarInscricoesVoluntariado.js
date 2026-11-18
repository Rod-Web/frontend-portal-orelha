// ./admin/scripts/requisicao/fetchCapturarInscricoesVoluntariado.js
import url from "../../../ambiente.js";

export async function fetchCapturarInscricoesVoluntariado() {
  try {
    const resposta = await fetch(
      `${url}/rotasprivadas/inscricoes-voluntariados`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status} — ${resposta.statusText}`);
    }

    const dados = await resposta.json();
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    console.error("Erro ao capturar inscrições:", erro);
    return { erro: "Não foi possível carregar as inscrições." };
  }
}
