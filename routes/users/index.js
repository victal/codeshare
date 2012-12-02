var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db;

var host = process.env.MONGO_NODE_DRIVER_HOST != null ? process.env.MONGO_NODE_DRIVER_HOST : 'localhost';
var port = process.env.MONGO_NODE_DRIVER_PORT != null ? process.env.MONGO_NODE_DRIVER_PORT : 27017;
console.log(host+':'+port);
var server = new Server(host, port, {safe:true, poolSize:10});
var db = new Db('codeshare', server, {native_parser:true});
db.open(function(err,db){
  if(err){
    console.log(err);
  }
});


exports.profile = function(req,res){
  if(req.session.user === null){
    res.redirect('/');
  }
  else{
    res.render('users',{
      user: req.session.user,
      scripts: []
    });
  }
};
