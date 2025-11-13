CREATE DATABASE biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE biblioteca;


CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(100) NOT NULL,
  perfil ENUM('leitor', 'bibliotecario') NOT NULL
);


CREATE TABLE livros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  ano YEAR,
  qtd INT NOT NULL DEFAULT 0
);


CREATE TABLE emprestimos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leitor_id INT NOT NULL,
  livro_id INT NOT NULL,
  data_emprestimo DATE NOT NULL DEFAULT (CURRENT_DATE()),
  data_prevista DATE NOT NULL,
  status ENUM('Em aberto', 'Devolvido') DEFAULT 'Em aberto',
  FOREIGN KEY (leitor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE
);
