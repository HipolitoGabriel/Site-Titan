const id = document.querySelector("#inputlogin");
const password = document.querySelector("#inputpassword");
const loginButton = document.querySelector("#senddados");
const URL_BASE = "https://6a871e5a70fbbd308f98bace.mockapi.io"
const senhaver = document.querySelector("#senhashow")

senhaver.addEventListener("click", alternarSenha);

loginButton.addEventListener("click", login)

async function getDados(e) {
    try{
        const response = await fetch(`${URL_BASE}/titan`)

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

    const idValue = id.value;
    const passwordValue = password.value;

    const usuarios = await getDados()
        const usuario = usuarios.find(
            (usuario) => usuario.id === idValue && usuario.senha === passwordValue 
        )
        if (usuario) {
            window.location.href = '../dashboard/index.html';
        }else {
            alert("ID ou senha incorretos. Tente novamente.");
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