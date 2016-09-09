'use strict';

// Imports
const exec = require('child_process').exec;

// Create a router for API routes
const apiRouter = require('express').Router();

// Basic test route to ensure the API is working
apiRouter.post("/ping", _commandResponder("uptime"));

// Updates the OpenBazaar-Server
apiRouter.post("/node/update", _commandResponder("cd ~/src && git fetch origin && git pull origin master && service openbazaard restart"));

// Create commands to control the server daemon
["start", "stop", "restart", "status"].forEach(function (cmd) {
  apiRouter.post("/node/" + cmd, _commandResponder("service openbazaard " + cmd));
});

// _commandResponder creates an express handler that executes the given command
// on the system and returns its output
function _commandResponder(cmd) {
  return function (res, req) {
    exec(cmd, function (error, stdout, stderr) {
      console.log(stdout);
      res.send(stdout);
    });
  }
}

module.exports = apiRouter
