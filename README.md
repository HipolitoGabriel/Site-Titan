# 📦 Sistema de Estoque

Sistema de gerenciamento de estoque desenvolvido em equipe, com o objetivo de facilitar o controle de **produtos, vendas e usuários**.

O sistema contará com diferentes níveis de acesso, permitindo que **administradores** e **vendedores** tenham funcionalidades de acordo com suas respectivas permissões.

> 🚧 **Status do projeto:** Em desenvolvimento
> Atualmente, o projeto possui apenas a estrutura do **front-end**.

---

## 🎯 Objetivo

O objetivo do sistema é oferecer uma interface simples e organizada para o gerenciamento de um estoque, permitindo futuramente:

* 📦 Gerenciar produtos
* 🛒 Registrar e acompanhar vendas
* 👤 Gerenciar usuários
* 📊 Visualizar informações através de um dashboard
* ⚙️ Alterar configurações do sistema
* 🔐 Controlar o acesso de acordo com o tipo de usuário

---

## 👥 Tipos de usuário

O sistema será dividido em dois principais tipos de contas:

### 👑 Administrador

O administrador terá acesso às funcionalidades de gerenciamento do sistema, como:

* Gerenciamento de produtos
* Gerenciamento de usuários
* Visualização de informações gerais
* Gerenciamento de vendas
* Configurações do sistema

### 🧑‍💼 Vendedor

O vendedor terá acesso principalmente às funcionalidades relacionadas às vendas e ao estoque, de acordo com as permissões definidas pelo sistema.

---

## 🖥️ Estrutura atual

Atualmente, o projeto está organizado da seguinte forma:

```text
/
├── configuracoes/
├── dashboard/
├── gerenciamento_usuario/
├── imagens/
├── login/
├── produtos/
├── vendas/
├── global.css
└── global.js
```

### 📁 `configuracoes/`

Responsável pelas telas e componentes relacionados às **configurações do sistema**.

### 📁 `dashboard/`

Contém a página principal do sistema, onde serão apresentadas informações gerais e indicadores do estoque e das vendas.

### 📁 `gerenciamento_usuario/`

Área destinada ao **gerenciamento dos usuários**, incluindo funcionalidades relacionadas às contas de administradores e vendedores.

### 📁 `imagens/`

Diretório destinado às imagens utilizadas no projeto.

### 📁 `login/`

Contém a interface de **login** do sistema.

A autenticação e o gerenciamento real das contas serão implementados posteriormente junto ao back-end.

### 📁 `produtos/`

Área destinada ao **gerenciamento dos produtos** do estoque.

### 📁 `vendas/`

Área destinada às funcionalidades relacionadas ao **registro e gerenciamento de vendas**.

### 📄 `global.css`

Arquivo destinado aos estilos globais utilizados pelo projeto.

### 📄 `global.js`

Arquivo que contém funcionalidades JavaScript utilizadas globalmente no projeto, incluindo a estrutura atual do menu/sidebar.

---

## 🚧 Desenvolvimento

O projeto está sendo desenvolvido em etapas.

### Atualmente

* [x] Estrutura inicial do front-end
* [x] Página de login
* [x] Dashboard
* [x] Área de produtos
* [x] Área de vendas
* [x] Gerenciamento de usuários
* [x] Configurações
* [x] Estrutura inicial da sidebar
* [ ] Implementação do back-end
* [ ] Banco de dados
* [ ] Sistema de autenticação
* [ ] Controle de permissões
* [ ] Integração entre front-end e back-end
* [ ] Testes

---

## 🛠️ Tecnologias

### Front-end

As tecnologias utilizadas no projeto podem ser adicionadas aqui conforme o desenvolvimento:

* HTML
* CSS
* JavaScript

> Esta seção será atualizada conforme novas tecnologias forem adicionadas ao projeto.

---

## 👨‍💻 Equipe

Projeto desenvolvido em equipe por estudantes/desenvolvedores com o objetivo de criar um sistema completo de gerenciamento de estoque.

---

## 📌 Observação

O projeto ainda está em desenvolvimento e algumas funcionalidades apresentadas neste README representam **funcionalidades planejadas**, que serão implementadas nas próximas etapas.

O foco atual está na construção e organização da interface do usuário (**front-end**), com a integração do back-end prevista para uma etapa posterior.
