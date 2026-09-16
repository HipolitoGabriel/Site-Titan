const URL_BASE = 'http://localhost:3000';
const sendProduto = document.getElementById('btnCadastro');
const formCadastro = document.getElementById('formCadastro');
const btnModal = document.getElementById('btnModal');
const btnExcluir = document.getElementById('btnExcluir');
const btnEditar = document.getElementById('btnEditar');

sendProduto.addEventListener('click', cadastrarProduto);
btnModal.addEventListener('click', modalOpen);
btnExcluir.addEventListener('click', excluirProduto);

async function getDados() {
    try {
        const response = await fetch(`${URL_BASE}/produtos`);

        if (!response.ok) {
            throw new Error('Erro na requisição');
        }

        return await response.json();

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

async function cadastrarProduto(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const quantidade = document.getElementById('quantidade').value;

    const novoProduto = {
        nome: nome,
        descricao: descricao,
        preco: Number(valor),
        quantidade: Number(quantidade)
    };

    try {
        const response = await fetch(`${URL_BASE}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoProduto)
        });

        if (!response.ok) {
            throw new Error('Erro ao cadastrar produto');
        }

        formCadastro.close();

        document
            .getElementById('formCadastro')
            .querySelector('form')
            ?.reset();

        init();

    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
    }
}

async function excluirProduto() {
    const id = prompt('Digite o ID do produto que deseja excluir:');

    try {
        const response = await fetch(`${URL_BASE}/produtos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir produto');
        }

        init();

    } catch (error) {
        console.error('Erro ao excluir produto:', error);
    }
}

function modalOpen() {
    formCadastro.showModal();
}

function updateDados(produtos) {
    const dadosContainer = document.querySelector('.cardProdutos');

    if (!dadosContainer) return;

    const htmlProdutos = produtos.map((produto) => `
        <div class="Produtos" id="produto-${produto.id}">
            <h3>ID</h3>
            <p>${produto.id}</p>

            <h3>Nome</h3>
            <p>${produto.nome}</p>

            <h3>Descrição</h3>
            <p>${produto.descricao}</p>

            <h3>Valor</h3>
            <p>R$ ${produto.preco}</p>

            <h3>Quantidade</h3>
            <p>${produto.quantidade}</p>
        </div>
    `).join('');

    dadosContainer.innerHTML = htmlProdutos;

    // Verifica se veio um ID pela URL
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    if (produtoId) {

        const produtoSelecionado = document.getElementById(
            `produto-${produtoId}`
        );

        if (produtoSelecionado) {

            // Destaca o produto
            produtoSelecionado.classList.add('produtoSelecionado');

            // Leva a tela até o produto
            setTimeout(() => {
                produtoSelecionado.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }
}

async function init() {
    const produtos = await getDados();

    if (produtos) {
        updateDados(produtos);
    }
}

init();