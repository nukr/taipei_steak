var models = require('../models')
  , Meal = models.Meal;


exports.list = function (req, res) {
  if (req.session.user && req.session.user.login) {
    Meal.find()
      .sort('order')
      .exec(function (err, meal) {
        res.render('index', {title: '點餐', meals: meal, user: req.session.user});
      });
  } else {
    res.redirect('/auth/form/index');
  }
};

exports.add = function (req, res) {
  var meal = new Meal({
    name: req.body.setname
    , order: req.body.order
    , category: req.body.category
    , price: req.body.price
    , remark: req.body.remark
  });
  meal.save(function (err, st) {
    res.render('result', {title: 'result', result: st, user: req.session.user});
  });
};

exports.sort = function (req, res) {
  Meal.find(function (err, doc) {
    var i = 0;
    for (i = 0; i < doc.length; i += 1) {
      (function (i) {
        Meal.findById(doc[i]._id, function (err, meal) {
          meal.order = i;
          meal.save(function () {
            console.log(meal);
          });
        });
      })(i);
    }
  });
};

exports.delete = function (req, res) {
  Meal.remove({_id: req.params.id}, function (err, doc) {
    res.redirect('/meal/add');
  });
};

exports.form = function (req, res) {
  Meal.find()
  .sort('order')
  .exec(function (err, meal) {
    res.render('meal', {title: 'meal', meals: meal, user: req.session.user});
  });
};

exports.orderup = function (req, res) {
  var id = parseInt(req.params.id);
  Meal.update({order: id}, {$set:{order: id + 100}}, function () {
    Meal.update({order:id - 1}, {$set:{order: id}}, function () {
      Meal.update({order: id + 100}, {$set:{order: id - 1}}, function () {
        console.log('done');
      });
    });
  });
};
