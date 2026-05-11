const { readDB, writeDB } = require('./db');

function getAllJokes() {
  const db = readDB();
  return db.jokes;
}

function getJokeById(id) {
  const db = readDB();
  return db.jokes.find(function(j) { return j.id == id; });
}

function createJoke(jokeData) {
  const db = readDB();
  const joke = {
    id: Date.now(),
    setup: jokeData.setup,
    punchline: jokeData.punchline,
    category: jokeData.category || 'General',
    author: jokeData.author,
    likes: 0,
    createdAt: new Date().toISOString()
  };
  db.jokes.push(joke);
  writeDB(db);
  return joke;
}

function updateJoke(id, data) {
  const db = readDB();
  const idx = db.jokes.findIndex(function(j) { return j.id == id; });
  if (idx === -1) return null;
  db.jokes[idx] = Object.assign(db.jokes[idx], data);
  writeDB(db);
  return db.jokes[idx];
}

function deleteJoke(id) {
  const db = readDB();
  const idx = db.jokes.findIndex(function(j) { return j.id == id; });
  if (idx === -1) return false;
  db.jokes.splice(idx, 1);
  writeDB(db);
  return true;
}

function likeJoke(id) {
  const db = readDB();
  const joke = db.jokes.find(function(j) { return j.id == id; });
  if (!joke) return null;
  joke.likes = (joke.likes || 0) + 1;
  writeDB(db);
  return joke;
}

module.exports = { getAllJokes, getJokeById, createJoke, updateJoke, deleteJoke, likeJoke };