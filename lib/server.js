"use strict";

// Imports
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./api");
const sessionStore = require("./session_store");
const stateWatcher = require("./states").Watcher;

// createServer is a factory for the http server. It returns an express app with
// routes and sessioning. It provides an additional `bind` method to listen to
// the port specified during instantiation.
module.exports = function createServer(port, sessionDBFile, stateFile) {
  // Create express app
  var server = express();

  // Create a listen method curried with the correct port
  server.bind = function () { return server.listen(port); }

  // Add logging
  server.use(morgan(":method :url \t\tstatus: :status\t\tresponse time: :response-time ms"));

  // Use JSON for requests and responses
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Allow crossorigin requests
  server.use(cors());

  // Create a state watcher that watches for the server to be ready
  var watcher = new stateWatcher(stateFile);

  // Add status route
  server.get("/status", function (req, res) {
    res.json({ status: watcher.State() });
  });

  // When the server is ready add the API routes
  var watcher = new stateWatcher(stateFile);
  watcher.on("transition", function (state) {
    console.log("Entering state: " + state);
  });
  watcher.on("ready", function () {
    addAuthenticatedAPIRoutes(server, sessionDBFile);
  });
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
