var exec = require('child_process').exec;

function run_python2(filename,callback){
  exec('/usr/bin/python2 '+filename+' < '+filename+'.stdin',callback);
}

function run_python3(filename,callback){
  exec('/usr/bin/env python '+filename+' < '+filename+'.stdin',callback);
}

function run_c(filename,callback){
  var exec_file = filename.split('.');
  exec_file.pop();
  exec_file.push('exe');
  exec_file = exec_file.join('.');
  exec('/usr/bin/gcc ' + filename +' -o ' + exec_file, function(error,stdout,stderr){
    if(stderr){
      callback(error,stdout,stderr);
      return;
    }
    if(error){
      callback(error,stdout,stderr);
      return;
    }
    exec('./'+exec_file,callback);
  });
}

function run_cpp(filename,callback){
  var exec_file = filename.split('.');
  exec_file.pop();
  exec_file.push('exe');
  exec_file = exec_file.join('.');
  exec('/usr/bin/g++ ' + filename +' -o ' + exec_file, function(error,stdout,stderr){
    if(stderr){
      callback(error,stdout,stderr);
      return;
    }
    if(error){
      callback(error,stdout,stderr);
      return;
    }
    exec('./'+exec_file,callback);
  });
}

function run_js(filename,callback){
  exec('/usr/bin/env js '+filename+' < '+filename+'.stdin',callback);
}

var file_runners = {
  'python': run_python2,
  'python3': run_python3,
  'c': run_c,
  'cpp': run_cpp,
  'js': run_js
};

exports.get = function(filetype){
  if(file_runners[filetype]){
    return file_runners[filetype];
  }
  return function(filename,callback){
    var stderr = 'Support to language not implemented yet';
    callback(null,null,stderr);
  };
};
