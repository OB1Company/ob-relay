"use strict";

// Imports
const fs = require("fs");
const eventEmitter = require("events");

// Valid states of an OpenBazaar server
const States = {
  INSTALLING_OB_RELAY: "INSTALLING_OB_RELAY",
  STARTING_OB_RELAY: "STARTING_OB_RELAY",

  INSTALLING_SYSTEM_PACKAGES: "INSTALLING_SYSTEM_PACKAGES",

  INSTALLING_OPENBAZAAR_SERVER: "INSTALLING_OPENBAZAAR_SERVER",
  STARTING_OPENBAZAAR_SERVER: "STARTING_OPENBAZAAR_SERVER",

  READY: "READY",
};

// Add the inversion of the `states` object to itself so we can lookup the
// enum key by the value. e.g. states["INSTALLING_SYSTEM_PACKAGES"] == 1
for (var key in States) {
  States[States[key]] = key;
}

// The beginneing and final states
const initialState = States.INSTALLING_OB_RELAY;
const finalState = States.READY;

// pollingInterval is the amount of time to wait before checking for new changes
const pollingInterval = 5000;

// Watcher watches a file for state changes and emits transition and ready events
class Watcher extends eventEmitter {
  constructor(stateFile) {
    super();
    this._stateFile = stateFile;
    this._state = initialState;
  }

  // Start tells the Watcher to begin checking the file for the current state
  // It polls every `pollingInterval` milliseconds until it's in the READY state
  Start() {
    var watcher = this;
    (function poll() {
      // Remember old state and load new state
      var oldState = watcher.State();
      watcher.LoadState();
      var newState = watcher.State();

      // If the new state is the final state we're done
      if (newState === finalState) return watcher.emit("ready");

      // If not the final state try again later
      setTimeout(poll, pollingInterval);

      // If the state isn't new we're done
      if (newState === oldState) return;

      // Otherwise we changed states; emit event
      watcher.emit("transition", newState);
    })();
  }

  // State returns the current state the Watcher is in
  State() {
    return this._state;
  }

  // LoadState gets and validates the state from the file, and updates the
  // Watcher's internal state
  LoadState() {
    if (!fs.existsSync(this._stateFile)) return initialState;

    var rawState = fs.readFileSync(this._stateFile).toString('ascii');
    if (!rawState || rawState === "") return initialState;

    var state = States[rawState];
    if (state) return this._state = state;
    throw Error("Unknown state: " + state);
  }
}

module.exports = { States, Watcher };
