var models = require('../models')
  , async = require('async')
  , Bill = models.Bill
  , Meal = models.Meal
  , moment = require('moment');

var queryBill = exports.queryBill = function (jade, queryDate, req, res) {
  var year = moment().year()
  var month = moment().month() + 1
  var day = moment().day()
  var today = moment()._d.toISOString();
  var tomorrow = moment().add('day', 1)._d.toISOString();
  console.log(today);

  Bill.find()
  .where('orderTime').gte(today)
  .where('orderTime').lt(tomorrow)
  .where('shift').equals('morning')
  .sort('billNo')
  .exec(function (err, bill) {
    async.series([
      function (callback) {
        bill.allDonePrice = 0;
        bill.allRawPrice = 0;
        bill.allServiceTip = 0
        bill.allDiscountTip = 0;
        bill.allCreditServiceTip = 0;
        bill.allNonCreditServiceTip = 0;
        bill.allCreditPrice = 0;
        bill.allQty = 0;
        bill.totalTurnOver = 0; //營業總額 = 原始金額 - 折扣
        for (var i = 0; i < bill.length; i += 1){
          bill[i].rawPrice = 0;
          bill[i].serviceTip = 0;
          bill[i].discountTip = 0;
          bill[i].donePrice = 0;
          for (var j = 0; j < bill[i].dishes.length; j += 1) {
            bill[i].rawPrice += bill[i].dishes[j].price * bill[i].dishes[j].quantity;
            bill.allQty += bill[i].dishes[j].quantity;
          }
          bill[i].serviceTip = Math.round( bill[i].rawPrice * 0.1 );
          if (bill[i].discount) {
            bill[i].discountTip = Math.round(bill[i].rawPrice - bill[i].rawPrice * 0.88);
            bill.allDiscountTip += bill[i].discountTip;
          }
          bill[i].donePrice = bill[i].rawPrice - bill[i].discountTip + bill[i].serviceTip;
          bill.allDonePrice += bill[i].donePrice;
          if (bill[i].credit) {
            bill.allCreditPrice += bill[i].donePrice;
            bill.allCreditServiceTip += bill[i].serviceTip;
          }
          bill.allRawPrice += bill[i].rawPrice;
          bill.allServiceTip += bill[i].serviceTip;
        }
        bill.totalTurnOver = bill.allRawPrice - bill.allDiscountTip;
        bill.cash = bill.allDonePrice - bill.allCreditPrice;
        bill.date = year + '年' + month + '月' + day + '日';

        var o = {};

        o.query = {'orderTime': {$gt: new Date(year + '/' + month + '/' + day)}};

        o.map = function () {
          for (var i = 0; i < this.dishes.length; i += 1) {
            var key = this.dishes[i].name;
            var value = {
              count: 1
              , qty: this.dishes[i].quantity
              , price: this.dishes[i].price
              , total: this.dishes[i].price * this.dishes[i].quantity
            };
            emit(key, value);
          }
        };

        o.reduce = function (k, valuesCountObjects) {
          reducedValue = { count: 0, price: 0, qty: 0, total: 0 };

          for (var idx = 0; idx < valuesCountObjects.length; idx++) {
            reducedValue.count += valuesCountObjects[idx].count;
            reducedValue.qty += valuesCountObjects[idx].qty;
            reducedValue.total += valuesCountObjects[idx].total;
            reducedValue.price = valuesCountObjects[idx].price;
          }

          return reducedValue;
        };

        Bill.mapReduce(o, function (err, results) {
          bill.totalQty = results;
          console.log(results)
          callback();
        });
      },
      function (callback) {
        res.render(jade, {title: '結帳', bills: bill, user: req.session.user});
        callback();
      }
    ]);
  });
}

exports.add = function (req, res) {
  var bill = new Bill({
    dishes: req.body.bill.dishes
    , billNo: req.body.bill.no
    , credit: req.body.bill.credit === 'true' ? true : false
    , discount: req.body.bill.discount === 'true' ? true : false
    , creator: req.body.bill.creator
    , shift: req.body.bill.shift
  });
  bill.save(function (err, doc) {
    res.send(doc);
  });
};

exports.delete = function (req, res) {
  Bill.remove({_id: req.params.id}, function (err, doc) {
    res.redirect('/checkout');
  });
};

exports.checkout = function (req, res) {
  queryBill('checkout', new Date(), req, res);
};

exports.report = function (req, res) {
  if (req.params[0] != undefined) {
    var year = req.params[0];
    var month = req.params[1];
    var date = req.params[2];
    var fullDate = year + '/' + month + '/' + date
    queryBill('report', new Date(fullDate), req, res);
  } else {
    queryBill('report', new Date(), req, res);
  }
};

exports.archive = function (req, res) {
  Bill.update({archive: false}, { $set: {archive: true}}, {multi: true}, function (err, doc) {
    res.send('update successful');
    console.log('update successful');
  });
};

exports.api = function (req, res) {
};
