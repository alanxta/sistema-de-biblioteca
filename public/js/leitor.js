const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = sessionStorage.getItem("usuarioId");
  const perfil = sessionStorage.getItem("perfil");

  if (!usuarioId || perfil !== "leitor") {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
  });

  carregarCatalogo();
  carregarMeusEmprestimos();

 


  async function carregarCatalogo() {
    const tabela = document.querySelector("#catalogo-tabela tbody");
    tabela.innerHTML = "";

    const res = await fetch(`${API_URL}/livros`);
    const livros = await res.json();

    livros.forEach((l) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${l.id}</td>
        <td>${l.titulo}</td>
        <td>${l.autor}</td>
        <td>${l.ano_publicacao || ""}</td>
        <td>${l.quantidade_disponivel}</td>
        <td>
          ${
            l.quantidade_disponivel > 0
              ? `<button onclick="solicitarEmprestimo(${l.id})">Pegar</button>`
              : "Indisponível"
          }
        </td>
      `;

      tabela.appendChild(tr);
    });
  }

 



  window.solicitarEmprestimo = async (livroId) => {
    const confirmar = confirm("Confirmar empréstimo?");
    if (!confirmar) return;

    const res = await fetch(`${API_URL}/emprestimos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leitor_id: usuarioId, livro_id: livroId })
    });

    const data = await res.json();

    if (data.erro) {
      alert(data.erro);
      return;
    }

    alert("Empréstimo realizado!");
    carregarCatalogo();
    carregarMeusEmprestimos();
  };

 



async function carregarMeusEmprestimos() {
  const tabela = document.querySelector("#meus-emprestimos-tabela tbody");
  tabela.innerHTML = "";


  const res = await fetch(`${API_URL}/emprestimos/${usuarioId}`);
  const emprestimos = await res.json();

  emprestimos.forEach((e) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.livro || '—'}</td>
      <td>${e.data_emprestimo}</td>
      <td>${e.data_prevista}</td>
      <td>${e.status}</td>
      <td>
        ${
          e.status === "ativo" || e.status === "Em andamento"
            ? `<button onclick="solicitarDevolucao(${e.id})">Devolver</button>`
            : "—"
        }
      </td>
    `;

    tabela.appendChild(tr);
  });
}



  window.solicitarDevolucao = async (idEmprestimo) => {
    if (!confirm("Deseja devolver este livro?")) return;

    const res = await fetch(`${API_URL}/emprestimos/devolver/${idEmprestimo}`, {
      method: "PUT"
    });

    const data = await res.json();

    if (data.erro) {
      alert(data.erro);
      return;
    }

    alert("Devolução concluída!");
    carregarCatalogo();
    carregarMeusEmprestimos();
  };
});
