"use strict";

// Imports
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./api");
const sessionStore = require("./session_store");
const stateWatcher = require("./states").Watcher;

// createServer is a factory for the http server. It returns an express app with
// routes and sessioning.
module.exports = function createServer(sessionDBFile, stateFile) {
  // Create express app and a server status watcher
  var server = express(),
    watcher = new stateWatcher(stateFile);

  // Add logging
  server.use(morgan(":method :url \t\tstatus: :status\t\tresponse time: :response-time ms"));

  // Configure routes to act as a standard JSON API with CORS support
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(function (req, res, next) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  // Add status routes for both standard JSON and JSONP
  server.get("/status.jsonp", (req, res) => res.jsonp({ status: watcher.State() }));
  server.get("/status", (req, res) => res.json({ status: watcher.State() }));

  // When the server is ready add the API routes
  watcher.on("transition", (state) => console.log("Entering state: " + state));
  watcher.on("ready", () => addAuthenticatedAPIRoutes(server, sessionDBFile));

  // Start watching for status changes
  watcher.Start();

  return server;
}

function addAuthenticatedAPIRoutes(server, sessionDBFile) {
  // Create session store
  var sessions = new sessionStore(sessionDBFile);

  // Add login route
  server.post("/login", sessions.loginHandler.bind(sessions));

  // Ensure all further routes are protected by sessioning
  server.use(sessions.validator.bind(sessions));

  // Add API routes
  server.use("/api/v1", apiRoutes);
}
