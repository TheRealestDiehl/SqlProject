const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Database Initialization
const db = new sqlite3.Database(":memory:"); // In-memory database
db.serialize(() => {
  db.run(
    `CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`
  );

  // Sample users
  db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);
  db.run(`INSERT INTO users (username, password) VALUES ('testuser', 'testpass')`);
});

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the SQL Injection Demo. Use /register or /login.");
});

// Registration Endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`; // Vulnerable
  db.run(query, (err) => {
    if (err) {
      res.status(400).send("Error: User already exists.");
    } else {
      res.send("Registration successful.");
    }
  });
});

// Login Endpoint (Vulnerable)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`; // Vulnerable
  db.get(query, (err, row) => {
    if (row) {
      res.send("Login successful.");
    } else {
      res.status(401).send("Invalid credentials.");
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
