//Handles all API endpoints
var express = require('express'),
    router = express.Router();

//List of endpoint sets
var endpoints = {
  accounts: './api/accounts',
  settings: './api/settings'
};

//Require and attach to router each endpoint
//passing in led to each of them
module.exports = function(led) {
  for(x in endpoints) {
    router.use('/' + x, require(endpoints[x])(led));
  };
  return router;
}
