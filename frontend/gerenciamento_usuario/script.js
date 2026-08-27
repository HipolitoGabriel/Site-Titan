const URL_BASE = "https://6a871e5a70fbbd308f98bace.mockapi.io"
const btn_get = document.querySelector("#btnget")
const btn_post = document.querySelector("#btnpost")
const nome = document.querySelector("#name")
const senha = document.querySelector("#senha")
const status = document.querySelector("#status") 
const cpf = document.querySelector("#cpf")
const adm = document.querySelector("#admin")
const quant = document.querySelector("#textbox")
const id_user = document.querySelector("#id_user")
const nome_user = document.querySelector("#nome_user")
const cpf_user = document.querySelector("#cpf_user")
const status_user = document.querySelector("#status_user")
const mod_user = document.querySelector("#mod_user")
const table = document.querySelector("#body_infos")

btn_post.addEventListener("click", postDados)
async function getDados() {
    try{
        const response = await fetch(`${URL_BASE}/titan`)
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        const data = await response.json()
        console.log(JSON.stringify(data))
        updata(data)
        updata()
    }
    catch (error) {
        console.error(error);
}
}
async function postDados(event){
    event.preventDefault()
    const nomeValue = nome.value
    const senhaValue = senha.value
    const statusValue = status.checked
    const cpfValue = cpf.value
    const admValue = adm.checked
    try{
        const response = await fetch(`${URL_BASE}/Usuarios`, {
            method: "POST",
            body: JSON.stringify({
                nome: nomeValue,
                senha: senhaValue,
                status: statusValue,
                cpf: cpfValue,
                administrador: admValue,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }catch(error){
        console.error(error)
    }
    getDados()
    nome.value = ""
    senha.value = ""
    status.checked = false
    cpf.value = ""
    adm.checked = false
}
function updata(data){
    body_infos.innerHTML = ""
    Usuarios = data
    Usuarios.forEach((usuario) => {
    const dadosHTML = `<tr>
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.cpf}</td>
            <td><!-- From Uiverse.io by arghyaBiswasDev --> 
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider"></span>
                </label>
            </td>
            <td><button>Mudar Senha</button></td>
        </tr>`;
    body_infos.innerHTML += dadosHTML;
    })
    quant.innerHTML = `<strong><p>Quantidade de usuários: <span style="color: #d4a359;">${Usuarios.length}</span></p></strong>`
}
// em desenvolvimento
// async function edit_senha(id){
//     try{
//         const response = await fetch(`${URL_BASE}/titan/{id}`, {
//             method: "PUT"
//         })
//     }
// }
// getDados()