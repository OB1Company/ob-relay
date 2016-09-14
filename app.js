"use strict";

// Imports
const serverFactory = require("./lib/server");

// Config
const port = process.env.OB_RELAY_PORT || 8080;
const sessionSecret = process.env.OB_RELAY_SESSION_SECRET;
const sessionDBFile = process.env.OB_RELAY_DB_FILE || "/home/openbazaar/obdata/OB-Mainnet.db";
const stateFile = process.env.OB_RELAY_STATE_FILE || "/home/openbazaar/.easybazaar_state";

// Create server
serverFactory(port, sessionSecret, sessionDBFile, stateFile).bind();

console.log("ob-relay listening on http://localhost:" + port);
