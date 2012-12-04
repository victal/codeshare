

var express = require('express'),
    sandbox = require('./sandbox'),
    users = require('./users');

var app = express();
app.set('views', __dirname + '/../views');
app.use(express.bodyParser());

app.post('/sandbox/:id/run',sandbox.run);
app.post('/sandbox/:id/save',sandbox.save);

app.post('/login',users.login_post);
app.post('/signup',users.signup_post);
app.post('/lost-password',users.lost_password_post);
app.post('/reset-password',users.reset_password_post);
app.post('/delete',users.delete);

app.get('/sandbox/:id',sandbox.sandbox);
app.get('/sandbox',sandbox.new_sandbox);

app.get('/login',users.login_get);
app.get('/logout',users.logout);
app.get('/signup',users.signup_get);
app.get('/profile/:id',users.profile);
//app.get('/lost-password',users.lost_password_get);
//app.get('/reset-password',users.reset_password_get);
//app.get('/reset',users.reset);
app.get('/',sandbox.home_view);

module.exports = app;
