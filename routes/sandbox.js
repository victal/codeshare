  var fs = require('fs');
  var async = require('async');
  var path = require('path');
  var runners = require('../utils/runners');
  var ObjectID = require('mongodb').ObjectID;
  var io = require('../app').io;

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
    res.render('index', { title: 'It\'s Alive!', scripts: []});
  };

  exports.sandbox = function(req,res){
    res.render('sandbox', {
    title: 'Sandbox',
    id: req.params.id,
    types: file_types,
    scripts: ['/js/jquery.js']
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
          if(stderr){
            content = stderr;
          }
          else{
            content = stdout;
          }
          res.send(content);
//          fs.unlink(filename,function(err){
//          fs.unlink(filename+'.stdin');
//          });
//          var difft = Date.now() - time0;
//          console.log(difft);
//          res.send(content);
//          console.log(content);
        });
      }
    }
  );
};
