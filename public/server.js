const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Database setup
const db = new sqlite3.Database("diehlDB.sqlite");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);
});

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Register endpoint
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err) => {
            if (err) {
                if (err.code === "SQLITE_CONSTRAINT") {
                    return res.status(400).json({ message: "Username already exists" });
                }
                return res.status(500).json({ message: "Error registering user" });
            }
            res.json({ message: "User registered successfully" });
        }
    );
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT password FROM users WHERE username = ?", [username], async (err, row) => {
        if (err) return res.status(500).json({ message: "Error during login" });

        if (!row) return res.status(400).json({ message: "Invalid username or password" });

        const isValid = await bcrypt.compare(password, row.password);
        if (isValid) {
            res.json({ message: "Login successful" });
        } else {
            res.status(400).json({ message: "Invalid username or password" });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
