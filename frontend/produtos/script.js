const URL_BASE = 'http://localhost:3000';
const sendProduto = document.getElementById('btnCadastro');
const formCadastro = document.getElementById('formCadastro');
const btnModal = document.getElementById('btnModal');

sendProduto.addEventListener('click', cadastrarProduto)
btnModal.addEventListener('click', modalOpen)

async function getDados() {
    try {
        const response = await fetch(`${URL_BASE}/produtos`);
        if (!response.ok) throw new Error('Erro na requisição');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}
async function cadastrarProduto() {
    const nome = document.getElementById('nome').value;    
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const quantidade = document.getElementById('quantidade').value;
    const img = document.getElementById('img').files[0];
    try {
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('valor', valor);
        formData.append('quantidade', quantidade);
        formData.append('img', img);
        const response = await fetch(`${URL_BASE}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data' // Não é necessário definir o Content-Type para FormData
            }, 
            body: formData
        });
        if (!response.ok) throw new Error('Erro ao cadastrar produto');
        return await response.json();
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
    }
    formCadastro.close();
}
function modalOpen() {
    formCadastro.showModal();
}
function updateDados(produtos) {
    // 1. Pega a div pai
    const dadosContainer = document.querySelector('.cardProdutos');
    
    if (!dadosContainer) return;

    // 2. Cria cada div .Produtos dentro da string
    const htmlProdutos = produtos.map((produto) => `
        <div class="Produtos">
            <img src="../imagens/favicon/android-chrome-512x512.png" alt="${produto.nome}">
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

    // 3. Coloca todas as divs .Produtos dentro da .cardProdutos
    dadosContainer.innerHTML = htmlProdutos;
}

// Executa o código
async function init() {
    const produtos = await getDados();
    if (produtos) {
        updateDados(produtos);
    }
}

init();