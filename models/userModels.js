const { readDB, writeDB } = require('./db');

function findUserByUsername(username) {
  const db = readDB();
  return db.users.find(function(u) { return u.username === username; });
}

function createUser(username, hashedPassword) {
  const db = readDB();
  const user = {
    id: Date.now(),
    username: username,
    password: hashedPassword
  };
  db.users.push(user);
  writeDB(db);
  return user;
}

module.exports = { findUserByUsername, createUser };