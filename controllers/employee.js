var pwd = require('pwd');
var models = require('../models');
var Employee = models.Employee;
exports.form = function (req, res) {
  res.render('employee', {title: '帳號密碼', user: req.session.user})
}

exports.add = function (req, res) {
  pwd.hash(req.body.password, function (err, salt, hash) {
    var employee = new Employee({
      username: req.body.username
      , password: hash.toString('base64')
      , salt: salt
      , realname: req.body.realname
      , phone: req.body.phone
    });
    employee.save(function (err, emp) {
      console.log(emp);
    });
  });
};

exports.admin= function (req, res) {
  pwd.hash('password', function (err, salt, hash) {
    var employee = new Employee({
      username: 'admin'
      , password: hash.toString('base64')
      , salt: salt
      , realname: 'admin'
      , phone: 'no phone'
    });
    employee.save(function (err, emp) {
      console.log(emp);
    });
  });
};
