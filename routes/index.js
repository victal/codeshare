
var express = require('express'),
    home = require('./home');


var app = express();
app.set('views', __dirname + '/../views');
app.use(express.bodyParser());
app.post('/sandbox/:id/run',home.run);
app.get('/sandbox/:id',home.sandbox);
app.get('/sandbox',home.new_sandbox);
app.get('/',home.home_view);

module.exports = app;
