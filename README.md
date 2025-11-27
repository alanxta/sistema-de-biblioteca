# 📚 Sistema de Biblioteca — Node.js, Express, MySQL

Este repositório contém um **Sistema de Biblioteca** completo, desenvolvido para gerenciar usuários, livros e empréstimos.
O projeto possui dois tipos de usuários: **Bibliotecário** e **Leitor**, cada um com funcionalidades específicas.

---

## 🚀 Sobre o Sistema

O sistema permite:

### 👩‍💼 **Bibliotecário**

* Cadastrar livros
* Editar livros
* Remover livros
* Visualizar todos os empréstimos realizados
* Marcar empréstimos como devolvidos

### 📖 **Leitor**

* Visualizar catálogo de livros
* Solicitar empréstimos (caso o livro tenha estoque)
* Ver seus próprios empréstimos ativos ou devolvidos
* Realizar devoluções

---

## 🛠 Tecnologias Utilizadas

* **Node.js**
* **Express.js**
* **MySQL (mysql2)**
* **HTML, CSS, JavaScript**
* **Fetch API**
* **CORS**

---


## ▶️ Como Rodar o Projeto

### 1️⃣ Instale as dependências

No terminal:

```bash
npm install
```

### 2️⃣ Inicie o servidor backend (Node.js)

```bash
node server.js
```

O servidor será iniciado em:

```
http://localhost:3000
```

### 3️⃣ Acesse o frontend

O projeto usa **arquivos estáticos**, então basta abrir no navegador:

```
public/index.html
```

✔ O Express também serve o frontend automaticamente ao rodar o servidor.

---


