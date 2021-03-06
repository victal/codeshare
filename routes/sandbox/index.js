var fs = require('fs');
var async = require('async');
var path = require('path');
var runners = require('./utils/runners');
var ObjectID = require('mongodb').ObjectID;
var chat = require('./io_chat');
var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db;

var accounts = require('../users/modules/account-manager').accounts;
var AM = require('../users/modules/account-manager');


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

var open_docs = {};

function getfromdb(id,callback){
  db.collection('codepads', {safe:true}, function(err,collection){
    if(err){
      //console.log('past err');
      console.log(err);
    }else{
      //console.log('past here');
      collection.findOne({_id:AM.getObjectId(id)},function(err,item){
        if(err){
          console.log(err);
        }else{
          callback(item);
          return;
        }
      });
    }
  });
  //console.log('calling back here');
}

exports.get_doc = getfromdb;


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
    user: req.session.user,
    scripts: []
  });
};

function save_user_docs(doc, user,callback){
  accounts.findOne({user:user.user},function(err, obj){
    if(err){
      callback(err,null);
      return;
    }
    if(obj){
      if(obj.docs){
        var j = 0;
        for(i = 0; i< obj.docs.length; i++){
          if(obj.docs[i] === doc){
            j = 1;
          }
          if(j == 0){
            obj.docs.push(doc);
          }
        }
      }else{
        obj.docs = [doc];
      }
      accounts.update({_id:obj._id},obj,callback(null,1));
    }
  });
}

exports.save = function(req,res){
  if(open_docs[req.params.id] == undefined && req.session.user != undefined){
    open_docs[req.params.id] = [req.session.user];
    //console.log(open_docs);
  }
  async.map(open_docs[req.param('id')], async.apply(save_user_docs, req.param('id')), function(err,results){
    getfromdb(req.params.id,function(item){
      var type = req.param('type');
      if(type == undefined){
        type = file_types['python'];
      }
      else{
        type = file_types[req.param('type')];
      }
      if(item === null){
        var new_item = {
          user: req.param('user'),
          type: type,
          text: req.param('text'),
          _id: new ObjectID(req.param('id'))
        };
        db.collection('codepads', function(err,collection){
          if(err){
            //not here
            console.log(err);
          }else{
            collection.insert(new_item,{safe:true},function(err,result){
              if(err){
                //here
                console.log(err);
              }else{
                var date = new Date();
                var minute = date.getMinutes();
                var min = minute < 10 ? '0' : '';
                res.send("Saved at "+date.getHours()+":"+min+minute);
              }
            });
          }
        });
      }else{
        var data = {text: req.param('text'), type: req.param('type')};
        db.collection('codepads', function(err,collection){
          if(err){
            console.log(err);
          }else{
            collection.update({_id:new ObjectID(req.params.id)},data, {safe:true},function(err,result){
              if(err){
                console.log(err);
              }else{
                var date = new Date();
                var minute = date.getMinutes();
                var min = minute < 10 ? '0' : '';
                res.send("Saved at "+date.getHours()+":"+min+minute);
              }
            });
          }
        });
      }
    });
  });
};

exports.sandbox = function(req,res){
  var text = '';
  var type = '';
  getfromdb(req.params.id,function(item){
    console.log(item);
    if(item !== null){
      text = item.text;
      type = item.type;
    }
    if(req.session.user){
      if(open_docs[req.params.id] === undefined){
        open_docs[req.params.id] = [req.session.user];
      }
      else{
        var i = 0;
        for(j = 0; j < open_docs[req.params.id].length; j++){
          if(open_docs[req.params.id][j]._id === req.session.user._id){
            i = 1;
          }
        }
        if(i == 0){
          open_docs[req.params.id].push(req.session.user);
        }
      }
    }
    res.render('sandbox', {
      chat_url: req.protocol + '://' + req.headers.host + '/chat',
      title: 'Sandbox',
      text: text,
      type: type,
      id: req.params.id,
      types: file_types,
      user: req.session.user,
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
            console.log(err);
            if(err){
              callback(err,null);
              return;
            }
            fs.write(fd,req.param('script'),0,req.param('script').length,0,function(err,written,buffer){
              console.log(err);
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
          var content = "No output";
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
