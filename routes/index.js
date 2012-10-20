

var express = require('express'),
    sandbox = require('./sandbox');

var app = express();
app.set('views', __dirname + '/../views');
app.use(express.bodyParser());
app.post('/sandbox/:id/run',sandbox.run);
app.get('/sandbox/:id',sandbox.sandbox);
app.get('/sandbox',sandbox.new_sandbox);
app.get('/',sandbox.home_view);

module.exports = app;
