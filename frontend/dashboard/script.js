const URL_BASE = 'http://localhost:3000';

async function carregarAlertas() {
    const resposta = await fetch(`${URL_BASE}/produtos`);
    const produtos = await resposta.json();

    const produtosBaixos = produtos.filter(
        produto => Number(produto.quantidade) <= 3
    );

    
}