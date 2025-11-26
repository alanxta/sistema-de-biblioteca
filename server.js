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

function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve([results]);
    });
  });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));


app.post("/api/usuarios", (req, res) => {
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




app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.json({ erro: "Preencha email e senha." });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro no login." });
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
  const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

  if (!titulo || !autor || !quantidade_disponivel) {
    return res.json({ erro: "Preencha os campos obrigatórios!" });
  }

  const sql = "INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)";
  db.query(sql, [titulo, autor, ano_publicacao, quantidade_disponivel], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ erro: "Erro ao adicionar livro." });
    }
    res.json({ mensagem: "Livro adicionado com sucesso!", id: result.insertId });
  });
});


app.put("/api/livros/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

  const sql = "UPDATE livros SET titulo=?, autor=?, ano_publicacao=?, quantidade_disponivel=? WHERE id=?";
  db.query(sql, [titulo, autor, ano_publicacao, quantidade_disponivel, id], (err) => {
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







app.post("/api/emprestimos", async (req, res) => {
  const { leitor_id, livro_id } = req.body;

  if (!leitor_id || !livro_id) {
    return res.status(400).json({ erro: "leitor_id e livro_id são obrigatórios." });
  }

  try {

    const [users] = await queryPromise(
      "SELECT id, perfil FROM usuarios WHERE id = ?",
      [leitor_id]
    );

    if (!users || users.length === 0)
      return res.status(400).json({ erro: "Leitor não encontrado." });

    if (users[0].perfil !== "leitor")
      return res.status(403).json({ erro: "Apenas leitores podem solicitar empréstimos." });

    const [books] = await queryPromise(
      "SELECT id, quantidade_disponivel FROM livros WHERE id = ?",
      [livro_id]
    );

    if (!books || books.length === 0)
      return res.status(404).json({ erro: "Livro não encontrado." });

    const livro = books[0];

    if (livro.quantidade_disponivel <= 0)
      return res.status(400).json({ erro: "Livro sem estoque." });
    const hoje = new Date().toISOString().slice(0, 10);

    const dtPrevista = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    })();

    const insertSql = `
      INSERT INTO emprestimos 
        (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status)
      VALUES (?, ?, ?, ?, 'ativo')
    `;

    const [insertResult] = await queryPromise(insertSql, [
      livro_id,
      leitor_id,
      hoje,
      dtPrevista
    ]);

    await queryPromise(
      "UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?",
      [livro_id]
    );

    res.status(201).json({
      mensagem: "Empréstimo criado com sucesso!",
      id: insertResult.insertId
    });

  } catch (err) {
    console.error("Erro em POST /api/emprestimos:", err);
    res.status(500).json({ erro: "Erro ao criar empréstimo." });
  }
});


app.get("/api/emprestimos", (req, res) => {
  const sql = `
    SELECT e.id,
           u.nome AS leitor,
           l.titulo AS livro,
           e.data_emprestimo,
           e.data_devolucao_prevista AS data_prevista,
           e.status
    FROM emprestimos e
    JOIN usuarios u ON u.id = e.leitor_id
    JOIN livros l ON l.id = e.livro_id
    ORDER BY e.id DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar empréstimos." });
    }
    res.json(results);
  });
});


app.get("/api/emprestimos/:leitorId", (req, res) => {
  const leitorId = req.params.leitorId;

  const sql = `
    SELECT 
      e.id,
      l.titulo AS livro,
      e.data_emprestimo,
      e.data_devolucao_prevista AS data_prevista,
      e.status
    FROM emprestimos e
      JOIN livros l ON l.id = e.livro_id
    WHERE e.leitor_id = ?
    ORDER BY e.id DESC
  `;

  db.query(sql, [leitorId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar empréstimos do leitor:", err);
      return res.status(500).json({ erro: "Erro ao buscar empréstimos do leitor." });
    }
    res.json(results);
  });
});


app.put("/api/emprestimos/devolver/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [emprestimos] = await queryPromise(
      "SELECT * FROM emprestimos WHERE id = ?",
      [id]
    );

    if (!emprestimos || emprestimos.length === 0)
      return res.status(404).json({ erro: "Empréstimo não encontrado." });

    const emprestimo = emprestimos[0];

    if (emprestimo.status !== "ativo")
      return res.status(400).json({ erro: "Empréstimo já devolvido." });

    const hoje = new Date().toISOString().slice(0, 10);

    await queryPromise(
      `UPDATE emprestimos 
       SET status='devolvido', data_devolucao_real=? 
       WHERE id=?`,
      [hoje, id]
    );

    await queryPromise(
      "UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?",
      [emprestimo.livro_id]
    );

    res.json({ mensagem: "Livro devolvido com sucesso!" });

  } catch (err) {
    console.error("Erro ao devolver livro:", err);
    res.status(500).json({ erro: "Erro ao devolver livro." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
