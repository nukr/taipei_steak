(function() {
  var Employee, models, pwd;

  pwd = require('pwd');

  models = require('../models');

  Employee = models.Employee;

  exports.index = function(req, res) {
    return res.render('auth', {
      title: '登入'
    });
  };

  exports.login = function(req, res) {
    var password;
    password = req.body.password.trim();
    return Employee.findOne({
      username: req.body.username
    }, function(err, user) {
      if (user === null) {
        console.log('使用者不存在');
        return res.send({
          status: 'user unavalible'
        });
      } else {
        return pwd.hash(password, user.salt, function(err, hash) {
          if (hash.toString('base64') === user.password) {
            req.session.user = {};
            req.session.user.login = true;
            req.session.user.realname = user.realname;
            req.session.user.username = user.username;
            req.session.user.shift = req.body.shift;
            console.log('登入成功');
            console.log(req.body.shift);
            return res.redirect('/');
          } else {
            console.log("登入失敗\n");
            return res.json({
              status: 'login failure'
            });
          }
        });
      }
    });
  };

  exports.logout = function(req, res) {
    req.session = null;
    return res.redirect('/');
  };

}).call(this);
