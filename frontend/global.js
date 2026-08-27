class MyCustomElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="menu">
            <div class="menuhead"> 
                <img src="../imagens/favicon/android-chrome-192x192-removebg-preview.png" alt="logo" width="100px" height="100px">
                <h2>TITAN CONTROL</h2>
            </div>
            <button class="btnmenu" id="btndashboard" style="margin-top: 50px;">
                <img src="../imagens/incones/dashboard-logo .png" alt="" width="32px" height="32px"> dashboard
            </button>
            <button class="btnmenu" id="btnprodutos"> 
                <img src="../imagens/incones/produtos-logo.png" alt="icone" width="32px" height="32px"> produtos
            </button>
            <button class="btnmenu" id="btnvendas"> 
                <img src="../imagens/incones/carrinho-logo.png" alt="icone" width="32px" height="32px"> vendas
            </button>
            <button class="btnmenu" id="btnuser"> 
                <img src="../imagens/incones/user-logo.png" alt="icone" width="32px" height="32px"> gestao de usuarios
            </button>
            <button class="btnmenu" id="btnconfig"> 
                <img src="../imagens/incones/config-logo.png" alt="icone" width="32px" height="32px"> configurações
            </button>
            <button class="btnmenu" id="btnsair" style="color: rgb(201, 5, 5); margin-top: 50px;">sair</button>
        </div>`;

        this.appendChild(template.content.cloneNode(true));
        this.redirecionamento();
    }

    redirecionamento() {
        this.querySelector('#btndashboard').addEventListener('click', () => {
            window.location.href = '../dashboard/index.html';
        });
        this.querySelector('#btnprodutos').addEventListener('click', () => {
            window.location.href = '../produtos/index.html';
        });
        this.querySelector('#btnvendas').addEventListener('click', () => {
            window.location.href = '../vendas/index.html';
        });
        this.querySelector('#btnuser').addEventListener('click', () => {
            window.location.href = '../gerenciamento_usuario/index.html';
        });
        this.querySelector('#btnconfig').addEventListener('click', () => {
            window.location.href = '../configuracoes/index.html';
        });
        this.querySelector('#btnsair').addEventListener('click', () => {
            window.location.href = '../login/index.html';
        });
    }
}

customElements.define("side-barra", MyCustomElement);