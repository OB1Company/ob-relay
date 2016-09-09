console.log('Here we go...');
'use strict';

// Create express app
const app = require('express')();

// Add routes
app.use("/api/v1", require("./routes/api"))
app.use("/sessions", require("./routes/sessions"))

// Set port
var port = process.env.PORT || 8080;

// Basic test route
app.get('/', function (req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api/v1');
});

// Start the server
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
