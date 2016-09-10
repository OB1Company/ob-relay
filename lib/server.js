"use strict";

// Imports
const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const apiRoutes = require("./api");
const sessionStore = require("./session_store");

// createServer is a factory for the http server. It returns an express app with
// routes and sessioning. It provides an additional `bind` method to listen to
// the port specified during instantiation.
module.exports = function createServer(port, sessionSecret, sessionDBFile) {
  // Create express app
  var server = express();

  // Create session store
  var sessions = new sessionStore(sessionSecret, sessionDBFile);

  // Add logging
  server.use(morgan(":method :url \t\tstatus: :status\t\tresponse time: :response-time ms"));

  // Parse JSON bodies and handle URL encoded params
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  // Add default route
  server.get("/", function (req, res) {
    res.send("Hello! The API is at http://localhost:" + port + "/api/v1\n");
  });

  // Return JSON responses
  server.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Add login route
  server.post("/login", sessions.loginHandler);

  // Ensure all further routes are protected by sessioning
  server.use(sessions.validator);

  // Add API routes
  server.use("/api/v1", apiRoutes);

  // Create a listen method curried with the correct port
  server.bind = function () { return server.listen(port); }

  return server;
}
