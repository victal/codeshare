
/**
 * Module dependencies.
 */

var express = require('express'),
    path = require('path'),
    app = exports.app = express(),
    router = require('./routes'),
    server = require('http').createServer(app),
    io = exports.io = require('socket.io').listen(server);

var chat = require('./routes/sandbox/io_chat');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'static')));
  app.use(router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



//app.listen(app.get('port'), function(){
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
