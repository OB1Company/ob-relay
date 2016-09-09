console.log("Here we go...");
"use strict";

// Create express app
const app = require("express")();

// use body parser so we can get info from POST and/or URL parameters
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies ==> watch this

// Add routes
app.use("/sessions", require("./routes/sessions"));
app.use("/api/v1", require("./routes/api"));

// Set port
var port = process.env.PORT || 8080;

// Basic test route
app.get("/", function (req, res) {
  res.send("Hello! The API is at http://localhost:" + port + "/api/v1\n");
});

// Start the server
app.listen(port);
console.log("Magic happens at http://localhost:" + port + "\n");
