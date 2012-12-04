var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var async = require('async');
var get_doc = require('../sandbox/').get_doc;

exports.login_get = function(req, res){
  res.render('login', {
    title: 'Hello - Please Login To Your Account',
    scripts: ['/vendor/jquery.min.js',
              '/vendor/jquery.form.js',
              '/js/views/login.js',
              '/js/form-validators/loginValidator.js',
              '/js/form-validators/emailValidator.js']
  });
};

exports.login_post = function(req, res){
  AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
      if (!o){
        res.send(e, 400);
      } else{
          req.session.user = o;
        if (req.param('remember-me') == 'true'){
          res.cookie('user', o.user, { maxAge: 900000 });
          res.cookie('pass', o.pass, { maxAge: 900000 });
        }
        res.send(o, 200);
      }
    });
};

exports.signup_get = function(req, res){
  res.render('signup', {
    title: 'Signup',
    countries: CT,
    scripts: ['/vendor/jquery.min.js',
              '/vendor/jquery.form.js',
              '/js/views/signup.js',
              '/js/form-validators/accountValidator.js',
              '/js/controllers/signupController.js',
              '/js/form-validators/emailValidator.js']
  });
};

exports.signup_post = function(req, res){
  AM.signup({
      name  : req.param('name'),
      email   : req.param('email'),
      user  : req.param('user'),
      pass  : req.param('pass'),
      country : req.param('country')
    }, function(e, o){
      if (e){
        res.send(e, 400);
      } else{
        res.send('ok', 200);
      }
    });
};

exports.lost_password_post = function(req, res){
  // look up the user's account via their email //
    AM.getEmail(req.param('email'), function(o){
      if (o){
        res.send('ok', 200);
        EM.dispatchResetPasswordLink(o, function(e, m){
        // this callback takes a moment to return //
        // should add an ajax loader to give user feedback //
          if (!e) {
          //  res.send('ok', 200);
          } else{
            res.send('email-server-error', 400);
            for (k in e) console.log('error : ', k, e[k]);
          }
        });
      } else{
        res.send('email-not-found', 400);
      }
    });
};

exports.reset_password_get = function(req, res){
  var email = req.query["e"];
    var passH = req.query["p"];
    AM.validateLink(email, passH, function(e){
      if (e != 'ok'){
        res.redirect('/');
      } else{
  // save the user's email in a session instead of sending to the client //
        req.session.reset = { email:email, passHash:passH };
        res.render('reset', { title : 'Reset Password' });
      }
    scripts :['/vendor/jquery.min.js',
              '/vendor/jquery.form.js',
              '/vendor/bootstrap-modal.js',
              '/vendor/bootstrap-transition.js',
              '/js/form-validators/resetValidator.js',
              '/js/views/reset.js'
    ]
    })
};

exports.reset_password_post = function(req, res){
  var nPass = req.param('pass');
  // retrieve the user's email from the session to lookup their account and reset password //
    var email = req.session.reset.email;
  // destory the session immediately after retrieving the stored email //
    req.session.destroy();
    AM.setPassword(email, nPass, function(o){
      if (o){
        res.send('ok', 200);
      } else{
        res.send('unable to update password', 400);
      }
    })
};

exports.logout = function(req,res){
  req.session.destroy();
  res.redirect('/');
}

function get_doc_type(doc,callback){
  console.log('get_doc_type');
  get_doc(doc,function(item){
    if(item != undefined){
      console.log(item);
      console.log(item.type);
      callback(null,item.type);
      return item.type;
    }
    console.log('else');
  });
}


exports.profile = function(req,res){
  var user_id = req.param('id');
  //console.log(user_id);
  AM.accounts.findOne({_id:AM.getObjectId(user_id)},function(err,obj){
    var docs = obj.docs;
    console.log(docs);
    if(docs == undefined){
      docs = [];
    }
    async.map(docs, get_doc_type, function(err,results){
      var d = {};
      console.log(results);
      for(var i = 0; i< docs.length; i++){
        var k = docs[i];
        d[k] = results[i];
      }
      console.log(d);
      res.render('profile',{
        user: req.session.user,
        title: 'User Profile',
        docs: d,
        scripts: []
      });
    });
  });
}
