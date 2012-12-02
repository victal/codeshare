

var express = require('express'),
    sandbox = require('./sandbox'),
    users = require('./users');

var app = express();
app.set('views', __dirname + '/../views');
app.use(express.bodyParser());

app.post('/sandbox/:id/run',sandbox.run);
app.post('/sandbox/:id/save',sandbox.save);
app.post('/login',sandbox.login_post);
app.post('/signup',sandbox.signup_post);
app.post('/lost-password',sandbox.lost_password_post);
app.post('/reset-password',sandbox.reset_password_post);
app.post('/delete',sandbox.delete);

app.get('/sandbox/:id',sandbox.sandbox);
app.get('/sandbox',sandbox.new_sandbox);
app.get('/login',sandbox.login_get);
app.get('/signup',sandbox.signup_get);
app.get('/lost-password',sandbox.lost_password_get);
app.get('/reset-password',sandbox.reset_password_get);
app.get('/print',sandbox.print);
app.get('/reset',sandbox.reset);
app.get('/',sandbox.home_view);

app.get('/login',users.login_get);
app.post('/login',users.login_post);

module.exports = app;
