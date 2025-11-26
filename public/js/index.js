const API_URL = "http://localhost:3000/api";


document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("register-container").classList.remove("hidden");
});

document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("register-container").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("register-nome").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const senha = document.getElementById("register-senha").value.trim();
  const perfil = document.getElementById("register-perfil").value;

  const msgEl = document.getElementById("register-error");

  if (!nome || !email || !senha || !perfil) {
    msgEl.textContent = "Preencha todos os campos!";
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, perfil })
    });

    const data = await resp.json();

    msgEl.textContent = data.mensagem || data.erro || "Erro desconhecido.";

    if (data.mensagem) {
      setTimeout(() => {
        document.getElementById("register-container").classList.add("hidden");
        document.getElementById("login-container").classList.remove("hidden");
        msgEl.textContent = "";
      }, 1500);
    }

  } catch (err) {
    msgEl.textContent = "Erro na conexão com o servidor.";
    console.error(err);
  }
});


document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-senha").value.trim();
  const msgEl = document.getElementById("login-error");

  if (!email || !senha) {
    msgEl.textContent = "Informe email e senha.";
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await resp.json();

    if (data.erro) {
      msgEl.textContent = data.erro;
      return;
    }


    sessionStorage.setItem("usuario", data.usuario.nome);
    sessionStorage.setItem("perfil", data.usuario.perfil);
    sessionStorage.setItem("usuarioId", data.usuario.id);

    msgEl.textContent = "Login realizado com sucesso!";


    setTimeout(() => {
      if (data.usuario.perfil === "bibliotecario") {
        window.location.href = "bibliotecario.html";
      } else {
        window.location.href = "leitor.html";
      }
    }, 1200);

  } catch (err) {
    msgEl.textContent = "Erro na conexão com o servidor.";
    console.error(err);
  }
});
