const cpf = document.querySelector("#inputlogin");
const password = document.querySelector("#inputpassword");
const loginButton = document.querySelector("#senddados");
const URL_BASE = "http://localhost:3000"
const senhaver = document.querySelector("#senhashow")

senhaver.addEventListener("click", alternarSenha);

loginButton.addEventListener("click", login)

async function getDados(e) {
    try{
        const response = await fetch(`${URL_BASE}/usuarios`)

        if(!response.ok){
            throw new Error(response.status);
        }

        const data = await response.json()
        return data
    }catch(error){
        console.error(error)
    }
}
async function login(e) {
    e.preventDefault();

    const cpfValue = cpf.value;
    const passwordValue = password.value;

    const usuarios = await getDados()
        const usuario = usuarios.find(
            (usuario) => usuario.cpf === cpfValue && usuario.senha === passwordValue 
        )
        if (usuario) {
            window.location.href = '../dashboard/index.html';
        }else {
            alert("CPF ou senha incorretos. Tente novamente.");
        }
    
}
function alternarSenha(e) {
    e.preventDefault();
    const botao = e.target;
    
    if (password.type === 'password') {
        password.type = 'text';
        botao.textContent = 'Ocultar';
    } else {
        password.type = 'password';
        botao.textContent = 'Mostrar';
    }
}