document.addEventListener("DOMContentLoaded", function () {
  // Seu código JavaScript aqui
});

const URL = "http://localhost:3400/produtos";
let modoEdicao = false;

let listaProduto = [];

const btnAdicionar = document.getElementById("btn-adicionar");
let tabelaProduto = document.querySelector("table>tbody");
let modalProduto = new bootstrap.Modal(
  document.getElementById("modal-produto"),
  {}
);
let tituloModal = document.querySelector("h4.modal-title");

let btnSalvar = document.getElementById("btn-salvar");
let btnCancelar = document.getElementById("btn-cancelar");

let formModal = {
  id: document.getElementById("id"),
  nome: document.getElementById("nome"),
  valor: document.getElementById("valor"),
  quantidadeEstoque: document.getElementById("quantidadeEstoque"),

  dataCadastro: document.getElementById("dataCadastro"),
  observacao: document.getElementById("observacao"),
};

btnAdicionar.addEventListener("click", () => {
  modoEdicao = false;
  tituloModal.textContent = "Adicionar produto";
  limparModalProduto();
  modalProduto.show();
});

btnSalvar.addEventListener("click", () => {
  // 1° Capturar os dados do modal
  let produto = obterProdutoDoModal();

  modoEdicao
    ? atualizarProdutoBackEnd(produto)
    : adicionarProdutoBackEnd(produto);
});

btnCancelar.addEventListener("click", () => {
  modalProduto.hide();
});

function obterProdutoDoModal() {
  return new Produto({
    id: formModal.id.value,
    nome: formModal.nome.value,
    valor: formModal.valor.value,
    quantidadeEstoque: formModal.quantidadeEstoque.value,

    dataCadastro: formModal.dataCadastro.value
      ? new Date(formModal.dataCadastro.value).toISOString()
      : new Date().toISOString(),
    observacao: formModal.observacao.value,
  });
}

function obterProduto() {
  fetch(URL, {
    method: "GET",
    headers: {
      Authorization: obterToken(),
    },
  })
    .then((response) => response.json())
    .then((produto) => {
      listaProduto = produto;
      console.log(produto);
      popularTabela(produto);
    })
    .catch();
}

function editarProduto(id) {
  modoEdicao = true;
  tituloModal.textContent = "Editar produto";

  let produto = listaProduto.find((produto) => produto.id == id);

  atualizarModalProduto(produto);

  modalProduto.show();
}

function atualizarModalProduto(produto) {
  formModal.id.value = produto.id;
  formModal.nome.value = produto.nome;
  formModal.valor.value = produto.valor;
  formModal.quantidadeEstoque.value = produto.quantidadeEstoque;

  formModal.dataCadastro.value = produto.dataCadastro.substring(0, 10);
  formModal.observacao.value = produto.observacao;
}

function limparModalProduto() {
  formModal.id.value = "";
  formModal.nome.value = "";
  formModal.valor.value = "";
  formModal.quantidadeEstoque.value = "";

  formModal.dataCadastro.value = "";
  formModal.observacao.value = "";
}

function excluirProduto(id) {
  let produto = listaProduto.find((c) => c.id == id);
  console.log(produto);
  if (confirm("Deseja realmente excluir o produto " + produto.nome)) {
    excluirProdutoBackEnd(produto);
  }
}

function criarLinhaNaTabela(produto) {
  // 1° Criar uma linha da tabela OK
  let tr = document.createElement("tr");

  // 2° Criar as TDs OK
  let tdId = document.createElement("td");
  let tdNome = document.createElement("td");
  let tdValor = document.createElement("td");
  let tdquantidadeEstoque = document.createElement("td");
  let tdDataCadastro = document.createElement("td");
  let tdObservacao = document.createElement("td");
  let tdAcoes = document.createElement("td");

  // 3° Atualizar as Tds com os valores do produto OK
  tdId.textContent = produto.id;
  tdNome.textContent = produto.nome;
  tdValor.textContent = produto.valor;
  tdquantidadeEstoque.textContent = produto.quantidadeEstoque;
  tdDataCadastro.textContent = new Date(
    produto.dataCadastro
  ).toLocaleDateString();
  tdObservacao.textContent = produto.observacao;


  tdAcoes.innerHTML = `<button onclick="editarProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                             Editar
                         </button>
                         <button onclick="excluirProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                             Excluir
                         </button>`;

  // 4° Adicionar as TDs dentro da linha criei. OK
  tr.appendChild(tdId);

  tr.appendChild(tdNome);
  tr.appendChild(tdValor);
  tr.appendChild(tdquantidadeEstoque);
  tr.appendChild(tdDataCadastro);
  tr.appendChild(tdObservacao);
  tr.appendChild(tdAcoes);

  // 5° Adicionar a linha na tabela.
  tabelaProduto.appendChild(tr);
}

// Function to populate table
function popularTabela(produto) {
  // Clear table content
  tabelaProduto.textContent = "";

  // Iterate through each product
  produto.forEach((produto) => {
    // Create row in table for each product
    criarLinhaNaTabela(produto);
  });
}

async function adicionarProdutoBackEnd(produto) {
  produto.dataCadastro = new Date().toISOString();

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: obterToken(),
    },
    body: JSON.stringify(produto),
  })
    .then((response) => response.json())
    .then((response) => {
      let novoProduto = new Produto(response);
      listaProduto.push(novoProduto);

      popularTabela(listaProduto);

      modalProduto.hide();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Produto cadastrado com sucesso!",
        showConfirmButton: false,
        timer: 2500,
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function atualizarProdutoBackEnd(produto) {
  fetch(`${URL}/${produto.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: obterToken(),
    },
    body: JSON.stringify(produto),
  })
    .then((response) => response.json())
    .then(() => {
      atualizarProdutoNaLista(produto, false);
      modalProduto.hide();

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Produto atualizado com sucesso!",
        showConfirmButton: false,
        timer: 2500,
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function excluirProdutoBackEnd(produto) {
  fetch(`${URL}/${produto.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: obterToken(),
    },  
  })


    .then(() => {
      atualizarProdutoNaLista(Produto, true);
      modalProduto.hide();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Produto excluido com sucesso!",
        showConfirmButton: false,
        timer: 2500,
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function atualizarProdutoNaLista(produto, removerProduto) {
  let indice = listaProduto.findIndex((c) => c.id == produto.id);

  removerProduto
    ? listaProduto.splice(indice, 1)
    : listaProduto.splice(indice, 1, produto);

  popularTabela(listaProduto);
}

obterProduto();
