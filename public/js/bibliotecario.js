const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("book-form");
  const tabelaLivros = document.querySelector("#livros-tabela tbody");
  const tabelaEmprestimos = document.querySelector("#emprestimos-tabela tbody");
  const btnCancelar = document.getElementById("cancel-edit-btn");
  const btnLogout = document.getElementById("logout-btn");

  const usuario = sessionStorage.getItem("usuario");
  const perfil = sessionStorage.getItem("perfil");

  if (!usuario || perfil !== "bibliotecario") {
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
    const ano_publicacao = document.getElementById("ano").value.trim();
    const quantidade_disponivel = document.getElementById("quantidade").value.trim();

    const livro = { titulo, autor, ano_publicacao, quantidade_disponivel };

    try {
      let res;

      if (id) {
        res = await fetch(`${API_URL}/livros/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livro)
        });
      } else {
        res = await fetch(`${API_URL}/livros`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livro)
        });
      }

      await res.json();
      alert("Livro salvo!");
      form.reset();
      document.getElementById("livro-id").value = "";
      btnCancelar.classList.add("hidden");
      carregarLivros();

    } catch (err) {
      alert("Erro ao salvar livro");
    }
  });

  btnCancelar.addEventListener("click", () => {
    form.reset();
    document.getElementById("livro-id").value = "";
    btnCancelar.classList.add("hidden");
  });



  
  async function carregarLivros() {
    const res = await fetch(`${API_URL}/livros`);
    const livros = await res.json();

    tabelaLivros.innerHTML = "";

    livros.forEach((l) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${l.id}</td>
        <td>${l.titulo}</td>
        <td>${l.autor}</td>
        <td>${l.ano_publicacao || ""}</td>
        <td>${l.quantidade_disponivel}</td>
        <td>
          <button onclick="editarLivro(${l.id}, '${l.titulo}', '${l.autor}', '${l.ano_publicacao}', ${l.quantidade_disponivel})">Editar</button>
          <button onclick="excluirLivro(${l.id})">Excluir</button>
        </td>
      `;

      tabelaLivros.appendChild(tr);
    });
  }

 



async function carregarEmprestimos() {
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
        ${e.status === "ativo"
          ? `<button onclick="atualizarStatus(${e.id})">Marcar devolvido</button>`
          : "—"}
      </td>
    `;

    tabelaEmprestimos.appendChild(tr);
  });
}

  


  window.editarLivro = (id, titulo, autor, ano_publicacao, quantidade_disponivel) => {
    document.getElementById("livro-id").value = id;
    document.getElementById("titulo").value = titulo;
    document.getElementById("autor").value = autor;
    document.getElementById("ano").value = ano_publicacao;
    document.getElementById("quantidade").value = quantidade_disponivel;
    btnCancelar.classList.remove("hidden");
  };





  window.excluirLivro = async (id) => {
    if (!confirm("Deseja excluir?")) return;
    await fetch(`${API_URL}/livros/${id}`, { method: "DELETE" });
    carregarLivros();
  };




  
window.atualizarStatus = async (id) => {
  const confirmar = confirm("Deseja realmente marcar este empréstimo como devolvido?");
  if (!confirmar) return;

  const res = await fetch(`${API_URL}/emprestimos/devolver/${id}`, {
    method: "PUT"
  });

  const data = await res.json();

  if (data.erro) {
    alert(data.erro);
    return;
  }

  alert("Empréstimo marcado como devolvido!");
  carregarEmprestimos();
};
});
