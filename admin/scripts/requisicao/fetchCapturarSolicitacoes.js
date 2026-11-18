// ./admin/scripts/requisicao/fetchCapturarSolicitacoes.js
import url from "../../../ambiente.js";

export async function fetchCapturarSolicitacoes() {
  try {
    const resposta = await fetch(`${url}/rotasprivadas/solicitacao-adocao`, {
      method: "GET",
      credentials: "include",
    });

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status} — ${resposta.statusText}`);
    }

    const dados = await resposta.json();
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    console.error("Erro ao capturar solicitações:", erro);
    return { erro: "Não foi possível carregar as solicitações." };
  }
}
