"use strict";

// Imports
const fs = require("fs");
const express = require("express");
const request = require("supertest");
const expect = require("chai").expect;
const sqlite3 = require("sqlite3").verbose();
const server = require("../../lib/server");
const sessionStore = require("../../lib/session_store");

// Test data
const dbFile = "/tmp/ob_relay_dbFile"
const username = "admin"
const password = "password1"

const shortSecret = Array(32).join("a");
const validSecret = shortSecret + "a";

describe("SessionStore", function () {
  before(function (done) {
    createTestDB(done);
  });

  after(function () {
    deleteTestDB();
  });

  describe("#constructor", function () {
    it("should fail if secret is empty", function () {
      expect(function () {
        new sessionStore("", "");
      }).to.throw("Session secret must be at least 32 characters");
    });

    it("should fail if secret is too short", function () {
      expect(function () {
        new sessionStore(shortSecret, "");
      }).to.throw("Session secret must be at least 32 characters");
    });

    it("should fail if dbFile doesn't exist ", function () {
      expect(function () {
        new sessionStore(validSecret, "fakeFile");
      }).to.throw("Database file not found: fakeFile");
    });

    it("should succeed if we have valid secret and dbFile", function () {
      new sessionStore(validSecret, dbFile);
    });
  });
});

// createTestDB creates a new sqlite3 db with just enough to tests sessions
function createTestDB(cb) {
  deleteTestDB();
  var db = new sqlite3.Database(dbFile);

  db.serialize(function () {
    db.run("CREATE TABLE settings (username TEXT, password TEXT)");
    db.run("INSERT INTO settings VALUES (?, ?)", username, password, cb);
  });
}

// deleteTestDB deletes the test DB file
function deleteTestDB() {
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
}
