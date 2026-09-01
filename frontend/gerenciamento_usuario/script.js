const URL_BASE = "http://localhost:3000"

// Seletores DOM
const btn_post = document.querySelector("#btnpost")
const nome = document.querySelector("#name")
const senha = document.querySelector("#senha")
const status = document.querySelector("#status") 
const cpf = document.querySelector("#cpf")
const adm = document.querySelector("#admin")
const quant = document.querySelector("#textbox")
const tableBody = document.querySelector("#body_infos")

btn_post.addEventListener("click", postDados)

async function getDados() {
    try {
        const response = await fetch(`${URL_BASE}/usuarios`)
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json()
        updata(data) // Chamada única enviando os dados da requisição
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    }
}

async function postDados(event) {
    event.preventDefault()
    
    try {
        const response = await fetch(`${URL_BASE}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome.value,
                senha: senha.value,
                status: status.checked,
                cpf: cpf.value,
                administrador: adm.checked,
            })
        })

        if (!response.ok) {
            throw new Error(`Erro ao cadastrar: ${response.status}`);
        }

        // Limpa o formulário apenas se a requisição for bem-sucedida
        nome.value = ""
        senha.value = ""
        status.checked = false
        cpf.value = ""
        adm.checked = false

        await getDados()
    } catch (error) {
        console.error("Erro no envio dos dados:", error)
    }
}

function updata(usuarios = []) {
    tableBody.innerHTML = ""

    usuarios.forEach((usuario) => {
        const tr = document.createElement("tr")
        
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.cpf}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${usuario.status ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            </td>
            <td><button class="btn-mudar-senha">Mudar Senha</button></td>
        `;

        // Evento do botão de mudar senha específico desta linha
        const btnMudarSenha = tr.querySelector(".btn-mudar-senha")
        btnMudarSenha.addEventListener("click", () => {
            const novaSenha = prompt(`Digite a nova senha para ${usuario.nome}:`)
            if (novaSenha) {
                edit_senha(usuario.id, novaSenha)
            }
        })

        tableBody.appendChild(tr)
    })

    quant.innerHTML = `<strong><p>Quantidade de usuários: <span style="color: #d4a359;">${usuarios.length}</span></p></strong>`
}

async function edit_senha(id, nova_senha) {
    try {
        // Rota corrigida usando interpolação e endpoint /usuarios
        const response = await fetch(`${URL_BASE}/usuarios/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: nova_senha
            })
        })

        if (!response.ok) {
            throw new Error(`Erro ao atualizar senha: ${response.status}`);
        }

        alert("Senha atualizada com sucesso!")
        getDados()
    } catch (error) {
        console.error("Erro ao editar senha:", error)
    }
}

// Inicialização
getDados()