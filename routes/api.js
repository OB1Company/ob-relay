'use strict';

const bodyParser = require('body-parser');
const apiRouter = require('express').Router();

// use body parser so we can get info from POST and/or URL parameters
apiRouter.use(bodyParser.json()); // support json encoded bodies
apiRouter.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies ==> watch this

// POST call to test access to the VPS is working
apiRouter.post('test', function (req, res) {
  commandResponse(res, "echo %PATH%");
});

// POST call to start OpenBazaar on the VPS
apiRouter.post('node/start', function (req, res) {
  commandResponse(res, "service openbazaard start");
});

// POST call to stop OpenBazaar on the VPS
apiRouter.post('node/stop', function (req, res) {
  commandResponse(res, "service openbazaard stop");
});

// POST call to restart OpenBazaar on the VPS
apiRouter.post('node/restart', function (req, res) {
  commandResponse(res, "service openbazaard restart");
});

// POST call to update and restart OpenBazaar on the VPS
apiRouter.post('node/update', function (req, res) {
  commandResponse(res, "cd ~/src && git fetch origin && git pull origin master && service openbazaard restart");
});

// GET call to return OpenBazaar status on the VPS
apiRouter.get('node/restart', function (req, res) {
  commandResponse(res, "service openbazaard status");
});


function commandResponse(res, cmd) {
  exec(cmd, function (error, stdout, stderr) {
    console.log(stdout);
    res.send(stdout);
  });
}

module.exports = apiRouter
