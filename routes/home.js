
var fs = require('fs');

exports.home_view = function(req, res){
  res.render('index', { title: 'It\'s Alive!', scripts: []});
};
exports.sandbox = function(req,res){
  res.render('sandbox', {title: 'Sandbox', id: req.params.id, scripts: ['/js/jquery.js']} );
}
exports.run = function(req,res){
  console.log(req.body);
  res.send(req.param('type',null));
}
