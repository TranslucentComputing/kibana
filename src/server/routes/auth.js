var express = require('express');
var request = require('request');
var config = require('../config');
var proxy = require('express-http-proxy');
var url = require('url');

// Create the router
var router = express.Router();

//Auth token
router.post('/token', proxy(config.auth_url, {
  forwardPath: function (req, res) {
    return url.parse(config.auth_url).pathname +  '/oauth/token';
  }
}));

//Logout
router.get('/logout', proxy(config.identity_url, {
  forwardPath: function (req, res) {
    return url.parse(config.identity_url).pathname + '/api/logout';
  }
}));

//Get logged in user data
router.get('/user', proxy(config.identity_url, {
  forwardPath: function (req, res) {
    return url.parse(config.identity_url).pathname + '/api/users/search/current?projection=authorities';
  }
}));

module.exports = router;
