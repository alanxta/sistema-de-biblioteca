const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("book-form");
  const tabelaLivros = document.querySelector("#livros-tabela tbody");
  const tabelaEmprestimos = document.querySelector("#emprestimos-tabela tbody");
  const btnCancelar = document.getElementById("cancel-edit-btn");
  const btnLogout = document.getElementById("logout-btn");


  const usuario = sessionStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }


  btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
  });


  carregarLivros();
  carregarEmprestimos();


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("livro-id").value;
    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const ano = document.getElementById("ano").value.trim();
    const qtd = document.getElementById("quantidade").value.trim();

    if (!titulo || !autor) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const livro = { titulo, autor, ano, qtd };

    try {
      let res;
      if (id) {

        res = await fetch(`${API_URL}/livros/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livro),
        });
      } else {

        res = await fetch(`${API_URL}/livros`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livro),
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar livro");

      alert("Livro salvo com sucesso!");
      form.reset();
      document.getElementById("livro-id").value = "";
      btnCancelar.classList.add("hidden");
      carregarLivros();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  });


  btnCancelar.addEventListener("click", () => {
    form.reset();
    document.getElementById("livro-id").value = "";
    btnCancelar.classList.add("hidden");
  });


  async function carregarLivros() {
    try {
      const res = await fetch(`${API_URL}/livros`);
      const livros = await res.json();
      tabelaLivros.innerHTML = "";

      livros.forEach((l) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${l.id}</td>
          <td>${l.titulo}</td>
          <td>${l.autor}</td>
          <td>${l.ano || ""}</td>
          <td>${l.qtd}</td>
          <td>
            <button class="btn btn-edit" onclick="editarLivro(${l.id}, '${l.titulo}', '${l.autor}', '${l.ano || ""}', ${l.qtd})">Editar</button>
            <button class="btn btn-danger" onclick="excluirLivro(${l.id})">Excluir</button>
          </td>
        `;
        tabelaLivros.appendChild(tr);
      });
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
    }
  }


  async function carregarEmprestimos() {
    try {
      const res = await fetch(`${API_URL}/emprestimos`);
      const emprestimos = await res.json();
      tabelaEmprestimos.innerHTML = "";

      emprestimos.forEach((e) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${e.leitor}</td>
          <td>${e.livro}</td>
          <td>${e.data_emprestimo}</td>
          <td>${e.data_prevista}</td>
          <td>${e.status}</td>
          <td>
            ${
              e.status === "Em aberto"
                ? `<button class="btn btn-success" onclick="atualizarStatus(${e.id}, 'Devolvido')">Marcar como devolvido</button>`
                : "-"
            }
          </td>
        `;
        tabelaEmprestimos.appendChild(tr);
      });
    } catch (err) {
      console.error("Erro ao carregar empréstimos:", err);
    }
  }


  window.editarLivro = (id, titulo, autor, ano, qtd) => {
    document.getElementById("livro-id").value = id;
    document.getElementById("titulo").value = titulo;
    document.getElementById("autor").value = autor;
    document.getElementById("ano").value = ano;
    document.getElementById("quantidade").value = qtd;
    btnCancelar.classList.remove("hidden");
  };

  window.excluirLivro = async (id) => {
    if (!confirm("Deseja realmente excluir este livro?")) return;
    await fetch(`${API_URL}/livros/${id}`, { method: "DELETE" });
    carregarLivros();
  };

  window.atualizarStatus = async (id, status) => {
    await fetch(`${API_URL}/emprestimos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    carregarEmprestimos();
  };
});
