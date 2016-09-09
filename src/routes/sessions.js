'use strict';

const express = require('express');
const jwt = require('njwt');
const auth = require('../authentication');
const config = require("../config");

// Create session router
const sessionRouter = express.Router();

// Create login endpoint
sessionRouter.post('/', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  auth.check(username, password).then(function (success) {
    if (success) {
      var token = jwt.create({ username: username }, config.sessionSecret);
      token.setExpiration();

      return res.json({ success: true, token: token.compact() });
    }

    res.json({ success: false, token: "" });
  }).catch(function (err) {
    console.log(err);
    res.json({ success: false, token: "" });
  });
});


module.exports = sessionRouter
