const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser } = require('../models/userModel');

const SECRET = 'joke_secret_key_2024';

function register(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const existing = findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const user = createUser(username, hashed);
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token: token, username: user.username });
}

function login(req, res) {
  const { username, password } = req.body;
  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
  res.json({ token: token, username: user.username });
}

module.exports = { register, login };