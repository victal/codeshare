var exec = require('child_process').exec;

function run_python2(filename,callback){
  exec('/usr/bin/python2 '+filename+' < '+filename+'.stdin',callback);
}

var file_runners = {
  'python': run_python2
};

exports.get = function(filetype){
  if(file_runners[filetype]){
    return file_runners[filetype];
  }
  return function(filename,callback){
    callback(new Error('Support to language not implemented yet'),'','');
  };
};
