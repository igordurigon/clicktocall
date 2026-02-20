const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const { authMiddleware, adminMiddleware } = require("./middleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { nome, email, senha, ramal } = req.body;
  const hash = await bcrypt.hash(senha, 10);

  await pool.query(
    "INSERT INTO users (nome,email,senha_hash,ramal,role) VALUES ($1,$2,$3,$4,'user')",
    [nome, email, hash, ramal]
  );

  res.json({ success: true });
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ error: "Usuário não encontrado" });

  const user = result.rows[0];
  const match = await bcrypt.compare(senha, user.senha_hash);

  if (!match)
    return res.status(400).json({ error: "Senha inválida" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, role: user.role });
});

router.put("/user/ramal", authMiddleware, async (req, res) => {
  await pool.query(
    "UPDATE users SET ramal=$1 WHERE id=$2",
    [req.body.ramal, req.user.id]
  );
  res.json({ success: true });
});

router.put("/user/password", authMiddleware, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [req.user.id]
  );

  const match = await bcrypt.compare(
    senhaAtual,
    user.rows[0].senha_hash
  );

  if (!match)
    return res.status(400).json({ error: "Senha incorreta" });

  const hash = await bcrypt.hash(novaSenha, 10);

  await pool.query(
    "UPDATE users SET senha_hash=$1 WHERE id=$2",
    [hash, req.user.id]
  );

  res.json({ success: true });
});

router.get(
  "/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const users = await pool.query(
      "SELECT id,nome,email,ramal,role FROM users"
    );
    res.json(users.rows);
  }
);

module.exports = router;