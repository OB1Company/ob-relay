'use strict';

const apiRouter = require('express').Router();
const exec = require('child_process').exec;
const jwt = require('njwt');
const config = require("../config");

// Check token before continuing
apiRouter.use(function (req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) return res.status(403).json({ success: false, message: "No token" });

  jwt.verify(token, config.sessionSecret, function (err, decoded) {
    if (err) return res.status(403).json({ success: false, error: err.toString() });
    next();
  });
});

// POST call to test access to the VPS is working
apiRouter.post('/test', function (req, res) {
  commandResponse(res, "echo $PATH");
});

// POST call to start OpenBazaar on the VPS
apiRouter.post('/node/start', function (req, res) {
  commandResponse(res, "service openbazaard start");
});

// POST call to stop OpenBazaar on the VPS
apiRouter.post('/node/stop', function (req, res) {
  commandResponse(res, "service openbazaard stop");
});

// POST call to restart OpenBazaar on the VPS
apiRouter.post('/node/restart', function (req, res) {
  commandResponse(res, "service openbazaard restart");
});

// POST call to update and restart OpenBazaar on the VPS
apiRouter.post('/node/update', function (req, res) {
  commandResponse(res, "cd ~/src && git fetch origin && git pull origin master && service openbazaard restart");
});

// GET call to return OpenBazaar status on the VPS
apiRouter.get('/node/restart', function (req, res) {
  commandResponse(res, "service openbazaard status");
});


function commandResponse(res, cmd) {
  exec(cmd, function (error, stdout, stderr) {
    console.log(stdout);
    res.send(stdout);
  });
}

module.exports = apiRouter
