'use strict';

// Imports
const fs = require("fs");
const jwt = require("njwt");
const sqlite3 = require("sqlite3").verbose();

// SessionStore manages user authentication and sessioning
// It authenticates against the OpenBazaar sqlite db
module.exports = class SessionStore {
  constructor(secret, dbFile) {
    // Ensure we have secure a session secret
    if (!(secret && secret.length && secret.length >= 32)) throw Error("Session secret must be at least 32 characters");

    // Ensure the database file exists
    if (!fs.existsSync(dbFile)) throw Error("Database file not found: " + dbFile);

    this._secret = secret;
    this._db = new sqlite3.Database(dbFile);
  }

  // loginHandler looks for a username/password and returns a JWT upon success
  loginHandler(req, res) {
    var username = req.body.username,
      password = req.body.password;

    // If the credentials are valid create a jwt for 1 week
    // Othersise return an error
    this._checkAuthentication(username, password).then(function (success) {
      if (!success) return res.json({ success: false, token: "" });

      var token = jwt.create({ username: username }, this._secret);
      token.setExpiration(Math.floor(new Date().getTime() / 1000) + 604800000);

      return res.json({ success: true, token: token.compact() });
    }).catch(function (err) {
      console.log(err);
      res.json({ success: false, token: "" });
    });
  }

  // validator is a middleware that continues if and only if a valid JWT is given
  validator(req, res, next) {
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;

    if (!token) return _renderAuthErr(res, "No token");

    jwt.verify(token, config.sessionSecret, function (err, decoded) {
      if (err) return _renderAuthErr(res, err.toString());
      next();
    });
  }

  // _checkAuthentication checks the sqlite3 db for the given username/password pair
  _checkAuthentication(username, password) {
    var db = this._db;
    return new Promise(function (fulfill, reject) {
      db.get("SELECT 1 FROM settings WHERE username = ? AND password = ?", username, password, function (err, row) {
        if (err) reject(err)
        else fulfill(!!row)
      });
    });
  }
}

// _renderAuthErr sends a forbidden error if an invalid token is given
function _renderAuthErr(res, err) {
  res.status(403).json({ success: false, message: "No token" });
}
