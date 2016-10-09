"use strict";

// Imports
const fs = require("fs");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./api");
const sessionStore = require("./session_store");
const stateWatcher = require("./states").Watcher;

// createServer is a factory for the http server. It returns an express app with
// routes and sessioning.
module.exports = function createServer(sessionDBFile, stateFile, sslCertFile) {
  // Create express app
  var server = express();

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
  server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  // Create a state watcher that watches for the server to be ready
  var watcher = new stateWatcher(stateFile);

  // Add status route
  server.get("/status", function (req, res) {
    res.json({ status: watcher.State() });
  });

  // Add cert route
  if (sslCertFile) {
    var cert = fs.readFileSync(sslCertFile);
    server.get("/cert", function (req, res) {
      res.setHeader('Content-disposition', 'attachment; filename=openbazaar_node.crt');
      res.setHeader('Content-Type', 'application/x-pem-file');
      res.send(cert);
    });
  }

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
