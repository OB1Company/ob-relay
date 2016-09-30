"use strict";

// Imports
const fs = require("fs");
const https = require("https");
const serverFactory = require("./lib/server");

// Config
const port = process.env.OB_RELAY_PORT || 8080;
const sessionDBFile = process.env.OB_RELAY_DB_FILE || "/home/openbazaar/data/OB-Mainnet.db";
const stateFile = process.env.OB_RELAY_STATE_FILE || "/home/openbazaar/.deploy/state";
const sslCertFile = process.env.OB_RELAY_SSL_CERT_FILE;
const sslKeyFile = process.env.OB_RELAY_SSL_KEY_FILE;

// Create server
var server = serverFactory(sessionDBFile, stateFile);

// Use SSL if we have a cert and key set
if (sslCertFile && sslKeyFile) {
  server = https.createServer({
    key: fs.readFileSync(sslKeyFile),
    cert: fs.readFileSync(sslCertFile)
  }, server);
}

server.listen(port);

console.log("ob-relay listening on http" + ((sslCertFile && sslKeyFile) ? 's' : '') + "://localhost:" + port);
