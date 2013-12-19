var models = require('../models');
var Employee = models.Employee;
var Meal = models.Meal;
var bill = require('./bill');

exports.index = function (req, res) {
  res.render('admin/dashboard', {title: 'Dashboard'});
};

exports.employee = function (req, res) {
  Employee.find()
  .exec(function (err, doc) {
    res.render('admin/employee', {title: '員工', emps: doc});
  });
};

exports.meal = function (req, res) {
  Meal.find()
  .exec(function (err, doc) {
    res.render('admin/meal', {title: '餐點', meals: doc});
  });
};

exports.charts = function (req, res) {
  res.render('admin/charts', {title: '圖表'});
};

exports.report = function (req, res) {
  bill.queryBill('admin/report', new Date(), req, res);
};
