require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { Pool } = require("pg");
const path = require("path");
const { getOAuthToken } = require("./oauth");

const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      ramal TEXT
    )
  `);

  const admin = await pool.query("SELECT * FROM users WHERE email='admin@admin.com'");
  if (admin.rows.length === 0) {
    const hash = await bcrypt.hash("admin123", 12);
    await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1,$2,$3)",
      ["admin@admin.com", hash, "admin"]
    );
  }
})();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token required" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(senha, user.rows[0].password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user.rows[0].id, role: user.rows[0].role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, role: user.rows[0].role });
});
app.put("/api/me/ramal", authMiddleware, async (req, res) => {
  try {
    const { ramal } = req.body;

    if (!ramal) {
      return res.status(400).json({ error: "Ramal é obrigatório" });
    }

    await pool.query(
      "UPDATE users SET ramal=$1 WHERE id=$2",
      [ramal, req.user.id]
    );

    res.json({ message: "Ramal atualizado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar ramal" });
  }
});

app.post("/api/call", authMiddleware, async (req, res) => {
  try {
    const { numero } = req.body;

    if (!numero) {
      return res.status(400).json({ error: "Número é obrigatório" });
    }

    const user = await pool.query(
      "SELECT ramal FROM users WHERE id=$1",
      [req.user.id]
    );

    const ramal = user.rows[0].ramal;

    if (!ramal) {
      return res.status(400).json({
        error: "Usuário não possui ramal configurado"
      });
    }

    const token = await getOAuthToken();

    const response = await axios.get(
      `https://138.122.67.122/api/server/${process.env.ASTERISK_SERVER_ID}/make-calls`,
      {
        params: {
          ramal: ramal,
          id_company: process.env.ASTERISK_COMPANY_ID,
          number: numero
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error("Erro Asterisk:", err.response?.data || err.message);

    res.status(500).json({
      error: "Erro ao realizar chamada",
      detail: err.response?.data || err.message
    });
  }
});

app.listen(9191, () => console.log("Server running on 9191"));
