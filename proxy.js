const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

// CORS für alle Routen erlauben
app.use(cors());
app.use(express.json());

const fs = require('fs');
const DB_PATH = __dirname + '/db.json';

function readUsers() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
}

// Registrierung
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ result: 'error', message: 'Alle Felder sind Pflicht!' });
  }
  let users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ result: 'error', message: 'Benutzername existiert bereits!' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ result: 'error', message: 'E-Mail existiert bereits!' });
  }
  users.push({ username, email, password });
  writeUsers(users);
  res.json({ result: 'success' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ result: 'error', message: 'Alle Felder sind Pflicht!' });
  }
  const users = readUsers();
  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
  if (!user) {
    return res.status(401).json({ result: 'error', message: 'Benutzername/E-Mail oder Passwort falsch!' });
  }
  res.json({ result: 'success', user: { username: user.username, email: user.email } });
});

app.listen(PORT, () => {
  console.log(`Proxy läuft auf http://localhost:${PORT}`);
});
