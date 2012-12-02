var fs = require('fs');
var async = require('async');
var path = require('path');
var runners = require('./utils/runners');
var ObjectID = require('mongodb').ObjectID;
var chat = require('./io_chat');
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

function getfromdb(id,callback){
  db.collection('codepads', {safe:true}, function(err,collection){
    if(err){
      console.log(err);
    }else{
      collection.findOne({_id:new ObjectID(id)},function(err,item){
        if(err){
          console.log(err);
        }else{
          callback(item);
        }
      });
    }
  });
  return null;
}

var file_suffixes = {
  'python': '.py',
  'python3': '.py',
  'cpp': '.cpp',
  'c': '.c',
  'js': '.js'
};

var file_types = {
  'python': 'Python 2',
  'python3': 'Python 3',
  'cpp': 'C++',
  'c': 'C',
  'js':'Javascript'
};

exports.home_view = function(req, res){
  res.render('index', {
    title: 'Codeshare',
    scripts: ['/vendor/jquery.min.js',
              '/vendor/jquery.form.js',
              '/vendor/bootstrap-modal.js',
              '/js/views/login.js',
              '/vendor/bootstrap-transition.js',
              '/js/controllers/loginController.js',
              '/js/form-validators/loginValidator.js',
              '/js/form-validators/emailValidator.js']
  });
};


exports.save = function(req,res){
  getfromdb(req.params.id,function(item){
    console.log(item);
    console.log(item === null);
    if(item === null){
      var new_item = {
        type: req.params.type,
        text: req.params.text,
        _id: new ObjectID(req.params.id)
      };
      db.collection('codepads', function(err,collection){
        if(err){
          console.log(err);
        }else{
          collection.insert(new_item,{safe:true},function(err,result){
            if(err){
              console.log(err);
            }else{
              var date = new Date();
              res.send("Saved at "+date.getHours()+":"+date.getMinutes());
            }
          });
        }
      });
    }else{
      var data = {text: req.params.text, type: req.params.type};
      db.collection('codepads', function(err,collection){
        if(err){
          console.log(err);
        }else{
          console.log('update');
          collection.update({_id:new ObjectID(req.params.id)},data, {safe:true},function(err,result){
            if(err){
              console.log(err);
            }else{
              var date = new Date();
              res.send("Saved at "+date.getHours()+":"+date.getMinutes());
            }
          });
        }
      });
    }
  });
};

exports.sandbox = function(req,res){
  var text = '';
  var type = '';
  getfromdb(req.params.id,function(item){
    if(item !== null){
      text = item.text;
      type = item.type;
    }
    res.render('sandbox', {
      chat_url: req.protocol + '://' + req.headers.host + '/chat',
      title: 'Sandbox',
      text: text,
      type: type,
      id: req.params.id,
      types: file_types,
      scripts: ['/js/jquery.js',
                '/socket.io/socket.io.js',
                '/channel/bcsocket.js',
                '/js/ace/ace.js',
                '/share/share.js',
                '/share/ace.js']
    });
  });
};

exports.new_sandbox = function(req,res){
  var objid = new ObjectID();
  res.redirect('/sandbox/'+objid);
};

exports.run = function(req,res){
  var filename ="tmp/code/"+req.param('id')+'_'+req.ip+file_suffixes[req.param('type')];
  filename = path.normalize(filename);
  var content = '';
  async.parallel([
    function(callback){
      fs.exists(filename,function(exists){
        if(exists){
          fs.writeFile(filename,req.param('script'),function(err){
            if(err){
              callback(err,null);
              return;
            }
            callback(null,null);
          });
        }
        else{
          fs.open(filename,'w',function(err,fd){
            if(err){
              callback(err,null);
              return;
            }
            fs.write(fd,req.param('script'),0,req.param('script').length,0,function(err,written,buffer){
              if(err){
                callback(err,null);
              }
              else {
                fs.close(fd);
                callback(null,null);}
            });
          });
        }
      });
    },
    function(callback){
      console.log(req.param('stdin'));
      fs.exists(filename+'.stdin',function(exists){
        if(exists){
          fs.writeFile(filename+'.stdin',req.param('stdin'),function(err){
            if(err){
              callback(err,null);
              return;
            }
            callback(null,null);
          });
        }
        else{
          fs.open(filename+'.stdin','w',function(err,fd){
            if(err){
              callback(err,null);
              return;
            }
            fs.write(fd,req.param('stdin'),0,req.param('stdin').length,0,function(err,written,buffer){
              if(err){
                callback(err,null);
              }
              else {
              fs.close(fd);
              callback(null,null);}
            });
          });
        }
      });
    }],
    function(err,results){
      if(err){console.dir(err);console.log(error.stack);}
      else{
        var exec_func = runners.get(req.param('type'));
        exec_func(filename, function(error,stdout,stderr){
          var content = "";
          var source = "stdout";
          if(stderr){
            content = stderr;
            source = "stderr";
          }
          else{
            content = stdout;
          }
          res.writeHead(200, {'Content-Type': 'text/json'});
          res.end(
            JSON.stringify({source:source, content:content})
          );
        });
      }
    }
  );
};
