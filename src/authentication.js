"use strict";

const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const file = "/home/openbazaar/obdata/OB-Mainnet.db";
// const file = "/Users/tyler/dev/obstores/1/data/OB-Mainnet.db";

if (!fs.existsSync(file)) {
  throw Error("Database file not found: " + file);
}

const db = new sqlite3.Database(file);

function check(username, password) {
  return new Promise(function (fulfill, reject) {
    db.get("SELECT 1 FROM settings WHERE username = ? AND password = ?", username, password, function (err, row) {
      if (err) reject(err)
      else fulfill(!!row)
    });
  });
}

module.exports = {
  check: check
}
