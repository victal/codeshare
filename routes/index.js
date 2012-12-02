

var express = require('express'),
    sandbox = require('./sandbox'),
    users = require('./users');

var app = express();
app.set('views', __dirname + '/../views');
app.use(express.bodyParser());
app.post('/sandbox/:id/run',sandbox.run);
app.post('/sandbox/:id/save',sandbox.save);
app.get('/sandbox/:id',sandbox.sandbox);
app.get('/sandbox',sandbox.new_sandbox);
app.get('/',sandbox.home_view);

app.get('/login',users.login_get);
app.post('/login',users.login_post);

module.exports = app;
