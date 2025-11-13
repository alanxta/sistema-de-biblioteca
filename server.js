// server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";

const app = express();
const PORT = 3000;


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "biblioteca"
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar com o banco", err);
  } else {
    console.log("Conectado ao banco!");
  }
});


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));




app.post("/usuarios", (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha || !perfil) {
    return res.json({ erro: "Preencha todos os campos!" });
  }

  const sql = "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)";
  db.query(sql, [nome, email, senha, perfil], (err) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao cadastrar usuário." });
    }
    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
  });
});



app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.json({ erro: "Preencha email e senha." });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao verificar login." });
    }

    if (results.length === 0) {
      return res.json({ erro: "Email ou senha incorretos." });
    }

    const usuario = results[0];
    res.json({ mensagem: "Login realizado com sucesso!", usuario });
  });
});


app.get("/api/livros", (req, res) => {
  db.query("SELECT * FROM livros", (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar livros." });
    res.json(results);
  });
});




app.post("/api/livros", (req, res) => {
  const { titulo, autor, ano, qtd } = req.body;

  if (!titulo || !autor || !qtd) {
    return res.json({ erro: "Preencha os campos obrigatórios!" });
  }

  const sql = "INSERT INTO livros (titulo, autor, ano, qtd) VALUES (?, ?, ?, ?)";
  db.query(sql, [titulo, autor, ano, qtd], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao adicionar livro." });
    }
    res.json({ mensagem: "Livro adicionado com sucesso!", id: result.insertId });
  });
});




app.put("/api/livros/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, autor, ano, qtd } = req.body;

  const sql = "UPDATE livros SET titulo=?, autor=?, ano=?, qtd=? WHERE id=?";
  db.query(sql, [titulo, autor, ano, qtd, id], (err) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao atualizar livro." });
    }
    res.json({ mensagem: "Livro atualizado com sucesso!" });
  });
});




app.delete("/api/livros/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM livros WHERE id=?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao excluir livro." });
    }
    res.json({ mensagem: "Livro excluído com sucesso!" });
  });
});



app.get("/api/emprestimos", (req, res) => {
  const sql = `
    SELECT e.id, u.nome AS leitor, l.titulo AS livro,
           e.data_emprestimo, e.data_prevista, e.status
    FROM emprestimos e
    JOIN usuarios u ON e.leitor_id = u.id
    JOIN livros l ON e.livro_id = l.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar empréstimos." });
    }
    res.json(results);
  });
});


app.put("/api/emprestimos/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE emprestimos SET status=? WHERE id=?";
  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao atualizar empréstimo." });
    }
    res.json({ mensagem: "Status do empréstimo atualizado!" });
  });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
