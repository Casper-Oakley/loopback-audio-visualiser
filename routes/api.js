//Handles all API endpoints
var express = require('express'),
    router = express.Router();

//List of endpoint sets
var endpoints = {
  accounts: './api/accounts'
};

//Require and attach to router each endpoint
for(x in endpoints) {
  router.use('/' + x, require(endpoints[x]));
};

module.exports = router;
