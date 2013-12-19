(function() {
  var Bill, Meal, add, async, calculate, checkout, convertDate, dishCount, e2m, genQuery, injectRandomDateIntoDatabase, m2e, models, moment, queryBill, report, reportApi, reportSpa, test, util;

  models = require('../models');

  async = require('async');

  moment = require('moment');

  util = require('util');

  Bill = models.Bill;

  Meal = models.Meal;

  m2e = exports.m2e = function(req, res) {
    return Bill.findByIdAndUpdate(req.params.id, {
      shift: 'evening'
    }, function() {
      return res.json({
        status: 'success'
      });
    });
  };

  e2m = exports.e2m = function(req, res) {
    return Bill.findByIdAndUpdate(req.params.id, {
      shift: 'morning'
    }, function() {
      return res.json({
        status: 'success'
      });
    });
  };

  test = exports.test = function(req, res) {
    return Bill.find().where('orderTime').gte(new Date('2013-05-31')).where('orderTime').lt(new Date('2013-06-01')).exec(function(err, bill) {
      return console.log(bill);
    });
  };

  injectRandomDateIntoDatabase = exports.injectRandomDateIntoDatabase = function(req, res) {
    var b, creator, credit, day, discount, shift, time, times, _i, _results;

    _results = [];
    for (day = _i = 1; _i <= 31; day = ++_i) {
      times = Math.round(Math.random() * 100);
      _results.push((function() {
        var _j, _results1;

        _results1 = [];
        for (time = _j = 1; 1 <= times ? _j <= times : _j >= times; time = 1 <= times ? ++_j : --_j) {
          credit = (Math.random() * 10) > 5 ? true : false;
          discount = (Math.random() * 10) > 5 ? true : false;
          shift = (Math.random() * 10) > 5 ? 'morning' : 'evening';
          creator = (Math.random() * 10) > 5 ? '呂立婷' : '羅葦';
          b = new Bill({
            billNo: time,
            credit: credit,
            discount: discount,
            dishes: [
              {
                name: 'OP',
                price: 680,
                quantity: Math.round(Math.random() * 10)
              }, {
                name: '美沙',
                price: 980,
                quantity: Math.round(Math.random() * 10)
              }
            ],
            shift: shift,
            creator: creator,
            orderTime: new Date("2013-05-" + day)
          });
          _results1.push(b.save(function(err, doc) {
            if (err) {
              return handleError(err);
            }
          }));
        }
        return _results1;
      })());
    }
    return _results;
  };

  genQuery = exports.genQuery = function(dateObj, shift) {
    var d, query;

    d = convertDate(dateObj);
    return query = {
      orderTime: {
        $gte: "" + d.today,
        $lt: "" + d.tomorrow
      },
      shift: shift
    };
  };

  convertDate = exports.convertDate = function(date) {
    var convertedDate;

    return convertedDate = {
      year: moment(date).format("YYYY"),
      month: moment(date).format("MM"),
      day: moment(date).format("DD"),
      today: moment(date).format("YYYY-MM-DD"),
      tomorrow: moment(date).add('days', 1).format("YYYY-MM-DD")
    };
  };

  dishCount = exports.dishCount = function(query, cb) {
    var o;

    o = {};
    o.query = query;
    o.map = function() {
      var dish, key, value, _i, _len, _ref, _results;

      _ref = this.dishes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dish = _ref[_i];
        key = dish.name;
        value = {
          count: 1,
          qty: dish.quantity,
          price: dish.price,
          total: dish.price * dish.quantity
        };
        _results.push(emit(key, value));
      }
      return _results;
    };
    o.reduce = function(k, valuesCountObjects) {
      var obj, reducedValue, _i, _len;

      reducedValue = {
        count: 0,
        price: 0,
        qty: 0,
        total: 0
      };
      for (_i = 0, _len = valuesCountObjects.length; _i < _len; _i++) {
        obj = valuesCountObjects[_i];
        reducedValue.count += obj.count;
        reducedValue.qty += obj.qty;
        reducedValue.total += obj.total;
        reducedValue.price = obj.price;
      }
      return reducedValue;
    };
    return Bill.mapReduce(o, function(err, results) {
      var result, _i, _len;

      results.overAll = 0;
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        results.overAll += result.value.total;
      }
      return cb(results);
    });
  };

  queryBill = exports.queryBill = function(dateObj, shift, cb) {
    var date, month, today, todayStart, tomorrow, year;

    year = moment(dateObj).year();
    month = moment(dateObj).month() + 1;
    date = moment(dateObj).date();
    todayStart = moment("" + year + "-" + month + "-" + date);
    today = todayStart._d.toISOString();
    tomorrow = todayStart.add('day', 1)._d.toISOString();
    return Bill.find().where('orderTime').gte(today).where('orderTime').lt(tomorrow).where('shift').equals(shift).sort('billNo').lean().exec(function(err, bill) {
      if (err) {
        return handleError(err);
      } else {
        return cb(bill);
      }
    });
  };

  add = exports.add = function() {};

  calculate = exports.calculate = function(bills, cb) {
    var b, bill, container, dish, _i, _j, _len, _len1, _ref;

    container = {};
    b = {};
    b.allDonePrice = 0;
    b.allRawPrice = 0;
    b.allServiceTip = 0;
    b.allDiscountTip = 0;
    b.allCreditServiceTip = 0;
    b.allNonCreditServiceTip = 0;
    b.allCreditPrice = 0;
    b.allQty = 0;
    b.totalTurnOver = 0;
    for (_i = 0, _len = bills.length; _i < _len; _i++) {
      bill = bills[_i];
      bill.rawPrice = 0;
      bill.serviceTip = 0;
      bill.discountTip = 0;
      bill.donePrice = 0;
      _ref = bill.dishes;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        dish = _ref[_j];
        bill.rawPrice += dish.price * dish.quantity;
        b.allQty += dish.quantity;
      }
      bill.serviceTip = Math.round(bill.rawPrice * 0.1);
      if (bill.discount) {
        bill.discountTip = Math.round(bill.rawPrice - bill.rawPrice * 0.88);
        b.allDiscountTip += bill.discountTip;
      }
      bill.donePrice = bill.rawPrice - bill.discountTip + bill.serviceTip;
      b.allDonePrice += bill.donePrice;
      if (bill.credit) {
        b.allCreditPrice += bill.donePrice;
        b.allCreditServiceTip += bill.serviceTip;
      }
      b.allRawPrice += bill.rawPrice;
      b.allServiceTip += bill.serviceTip;
    }
    b.totalTurnOver = b.allRawPrice - b.allDiscountTip;
    b.cash = b.allDonePrice - b.allCreditPrice;
    container.info = b;
    container.bills = bills;
    return cb(container);
  };

  reportSpa = exports.reportSpa = function(req, res) {
    return res.render('report_spa');
  };

  checkout = exports.checkout = function(req, res) {
    var today;

    today = new Date();
    return queryBill(today, req.session.user.shift, function(bills) {
      return res.render('checkout', {
        'title': '結帳',
        'bills': bills,
        'user': req.session.user
      });
    });
  };

  report = exports.report = function(req, res) {
    var today;

    today = new Date();
    return queryBill(today, req.session.user.shift, function(bills) {
      return calculate(bills, function(cBills) {
        console.log(cBills);
        return res.render('report', {
          'title': '報表',
          'cBills': cBills,
          'user': req.session.user
        });
      });
    });
  };

  reportApi = exports.reportApi = function(req, res) {
    var date, queryString, r;

    r = req.params;
    date = "" + r.year + "-" + r.month + "-" + r.day;
    queryString = genQuery(new Date("" + r.year + "-" + r.month + "-" + r.day), r.shift);
    return queryBill(date, r.shift, function(bills) {
      return calculate(bills, function(calculatedBills) {
        return dishCount(queryString, function(dishCountTable) {
          var o;

          o = {};
          o.c = calculatedBills;
          o.dishCountTable = dishCountTable;
          return res.json(o);
        });
      });
    });
  };

}).call(this);
