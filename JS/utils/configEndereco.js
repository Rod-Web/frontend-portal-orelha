/* /JS/utils/configEndereco.js */

const camposEndereco = {
  logradouro: document.getElementById("logradouro"),
  bairro: document.getElementById("bairro"),
  cidade: document.getElementById("cidade"),
  estado: document.getElementById("estado"),
};

const placeholdersOriginais = {
  logradouro: camposEndereco.logradouro.placeholder,
  bairro: camposEndereco.bairro.placeholder,
  cidade: camposEndereco.cidade.placeholder,
  estado: camposEndereco.estado.placeholder,
};

export function travarCamposEndereco() {
  Object.values(camposEndereco).forEach((campo) => {
    campo.readOnly = true;
  });
}

export function mostrarBuscando() {
  Object.values(camposEndereco).forEach((campo) => {
    campo.placeholder = "Buscando...";
  });
}

export function preencherEndereco(endereco) {
  camposEndereco.logradouro.value = endereco.logradouro;
  camposEndereco.bairro.value = endereco.bairro;
  camposEndereco.cidade.value = endereco.localidade;
  camposEndereco.estado.value = endereco.uf;
}

export function limparEndereco() {
  Object.values(camposEndereco).forEach((campo) => {
    campo.value = "";
  });

  restaurarPlaceholders();
}

export function restaurarPlaceholders() {
  camposEndereco.logradouro.placeholder = placeholdersOriginais.logradouro;

  camposEndereco.bairro.placeholder = placeholdersOriginais.bairro;

  camposEndereco.cidade.placeholder = placeholdersOriginais.cidade;

  camposEndereco.estado.placeholder = placeholdersOriginais.estado;
}