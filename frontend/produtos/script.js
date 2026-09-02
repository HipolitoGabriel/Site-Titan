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
        if (!response.ok) throw new Error('Erro na requisição');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

async function cadastrarProduto(e) {
    // 1. Evita que o formulário recarregue a página
    e.preventDefault();

    const nome = document.getElementById('nome').value;    
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const quantidade = document.getElementById('quantidade').value;

    // 2. Cria o objeto JSON puro
    const novoProduto = {
        nome: nome,
        descricao: descricao,
        preco: Number(valor), // Mapeado como 'preco' para o json-server
        quantidade: Number(quantidade)
    };

    try {
        // 3. Envia o objeto formatado como JSON
        const response = await fetch(`${URL_BASE}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(novoProduto)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar produto');

        // 4. Fecha o modal, limpa o formulário e atualiza a tela
        formCadastro.close();
        document.getElementById('formCadastro').querySelector('form')?.reset();
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
        if (!response.ok) throw new Error('Erro ao excluir produto');
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
        <div class="Produtos">
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
}

async function init() {
    const produtos = await getDados();
    if (produtos) {
        updateDados(produtos);
    }
}

init();