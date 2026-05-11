const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SECRET = 'joke_secret_key_2024';
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const init = { users: [], jokes: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });
  const db = readDB();
  if (db.users.find(u => u.username === username))
    return res.status(409).json({ error: 'Username already taken' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), username, password: hashed };
  db.users.push(user);
  writeDB(db);
  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, username });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

app.get('/api/jokes', (req, res) => {
  const db = readDB();
  res.json(db.jokes);
});

app.get('/api/jokes/:id', (req, res) => {
  const db = readDB();
  const joke = db.jokes.find(j => j.id == req.params.id);
  if (!joke) return res.status(404).json({ error: 'Joke not found' });
  res.json(joke);
});

app.post('/api/jokes', authenticate, (req, res) => {
  const { setup, punchline, category } = req.body;
  if (!setup || !punchline)
    return res.status(400).json({ error: 'Setup and punchline required' });
  const db = readDB();
  const joke = {
    id: Date.now(),
    setup, punchline,
    category: category || 'General',
    author: req.user.username,
    likes: 0,
    createdAt: new Date().toISOString()
  };
  db.jokes.push(joke);
  writeDB(db);
  res.status(201).json(joke);
});

app.put('/api/jokes/:id', authenticate, (req, res) => {
  const db = readDB();
  const idx = db.jokes.findIndex(j => j.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Joke not found' });
  if (db.jokes[idx].author !== req.user.username)
    return res.status(403).json({ error: 'Not your joke' });
  db.jokes[idx] = { ...db.jokes[idx], ...req.body, id: db.jokes[idx].id };
  writeDB(db);
  res.json(db.jokes[idx]);
});

app.delete('/api/jokes/:id', authenticate, (req, res) => {
  const db = readDB();
  const idx = db.jokes.findIndex(j => j.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Joke not found' });
  if (db.jokes[idx].author !== req.user.username)
    return res.status(403).json({ error: 'Not your joke' });
  db.jokes.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Joke deleted' });
});

app.patch('/api/jokes/:id/like', authenticate, (req, res) => {
  const db = readDB();
  const joke = db.jokes.find(j => j.id == req.params.id);
  if (!joke) return res.status(404).json({ error: 'Joke not found' });
  joke.likes = (joke.likes || 0) + 1;
  writeDB(db);
  res.json(joke);
});

app.listen(PORT, () => console.log('Joke server running at http://localhost:3000'));