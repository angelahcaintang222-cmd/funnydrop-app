const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../db.json');

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

module.exports = { readDB, writeDB };