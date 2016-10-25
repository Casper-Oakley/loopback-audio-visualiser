var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose');


//Connect to mongoose for accounts getting/setting
mongoose.connect('mongodb://localhost/lav');

var Schema = mongoose.Schema;

var Account = new Schema({
  username : String,
  password : String
});

var accountModel = mongoose.model('Account', Account);

var modelInstance = new accountModel();
modelInstance.username = 'casper';
modelInstance.password = 'test';
modelInstance.save(function (err) {
  if(err) console.log(err);
});

router.get('/', function(req, res) {
  accountModel.findOne({ 'username': 'casper'}, 'username password', function (err, acc) {
    if (err) {
      res.status(404).send({error: err});
    } else {
      res.status(200).send(acc);
    }
  });
});

module.exports = router;
