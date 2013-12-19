var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

require('./meal');
require('./bill');
require('./employee');

exports.Meal = mongoose.model('Meal');
exports.Bill = mongoose.model('Bill');
exports.Employee = mongoose.model('Employee');

