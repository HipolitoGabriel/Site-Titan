const id = document.querySelector("#inputlogin");
const password = document.querySelector("#inputpassword");
const loginButton = document.querySelector("#senddados");
const URL_BASE = "https://6a7f09823183f5fd884ac189.mockapi.io"

loginButton.addEventListener("click", login)

async function getDados(e) {
    try{
        const response = await fetch(`${URL_BASE}/Usuarios`)

        if(!response.ok){
            throw new Error(response.status);
        }

        const data = await response.json()
        return data
    }catch(error){
        console.error(error)
    }
}
function login(e) {
    e.preventDefault();

    const idValue = id.value;
    const passwordValue = password.value;

    const usuarios = await getDados()
    usuarios.forEach((usuario) => {
        alert("foi")
        if (usuario.id === idValue && usuario.senha === passwordValue) {
            window.location.href = '../dashboard/index.html';
        } else {
            alert("CPF ou senha incorretos. Tente novamente.");
        }
    });
}
getDados()