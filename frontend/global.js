const btnDashboard = document.getElementById('btndashboard');
const btnProdutos = document.getElementById('btnprodutos');
const btnVendas = document.getElementById('btnvendas');
const btnUser = document.getElementById('btnuser');
const btnConfig = document.getElementById('btnconfig');
const btnSair = document.getElementById('btnsair');

function redirecionamento() {
    btnDashboard.addEventListener('click', () => {
        window.location.href = '../dashboard/index.html';
    });
    btnProdutos.addEventListener('click', () => {
        window.location.href = '../produtos/index.html';
    });
    btnVendas.addEventListener('click', () => {
        window.location.href = '../vendas/index.html';
    });
    btnUser.addEventListener('click', () => {
        window.location.href = '../gerenciamento_usuario/index.html';
    });
    btnConfig.addEventListener('click', () => {
        window.location.href = '../configuracoes/index.html';
    });
    btnSair.addEventListener('click', () => {
        window.location.href = '../login/index.html';
    });
}
redirecionamento()
