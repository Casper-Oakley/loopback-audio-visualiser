var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser');

var index = require('./routes/index'),
    api = require('./routes/api');

var app = express();


//Initiate sockets

//boilerplate express. Using EJS, body parser and cookie parser
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/', api);

app.use('/', index);


//Any uncaught routes go to 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Once server instance setup, run socket IO
var server = app.listen(3000, function() {
  var host = 'localhost';
  var port = server.address().port;
  console.log('App listening at http://' + host + ':' + port);
});

var io = require('socket.io').listen(server);
require('./routes/socket')(io);

module.exports = app;
