
/**
 * Module dependencies.
 */

var express = require('express')
  , meal = require('./controllers/meal')
  , bill = require('./controllers/bill')
  , bills = require('./controllers/bills')
  , auth = require('./controllers/auth')
  , employee = require('./controllers/employee')
  , admin = require('./controllers/admin')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.cookieSession());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Meals
app.get('/', meal.list)
app.get('/meals', meal.list);
app.get('/meal/add', meal.form);
app.post('/meal/add', meal.add);
app.get('/meal/order/up/:id', meal.orderup);
app.get('/meal/delete/:id', meal.delete);
app.get('/sortmeal', meal.sort);


app.get('/bill/delete/:id', bill.delete);
app.post('/bill/add', bill.add);
app.get('/checkout', bills.checkout);
app.get(/^\/report(?:(?:\/(\w+))(?:\/(\w+))(?:\/(\w+)))?$/, bills.report);
app.get(/^\/archive\/(\w+)/, bill.archive);
app.get(/^\/auth\/(\w+)?/, auth.index);
app.post('/auth', auth.login);
app.get('/logout', auth.logout);
app.get('/admin', admin.index);
app.get('/admin/dashboard', admin.index);
app.get('/admin/employee', admin.employee);
app.get('/admin/meal', admin.meal)
app.get('/admin/charts', admin.charts)
app.get('/admin/report/:date', admin.report)
app.get('/report_spa', bills.reportSpa)
app.get('/api/report/:year/:month/:day/:shift', bills.reportApi)
app.get('/test', bills.test)
app.get('/m2e/:id', bills.m2e)
app.get('/e2m/:id', bills.e2m)
app.get('/employee', employee.form)
app.get('/employee/admin', employee.admin)
app.post('/employee/add', employee.add);
// app.get('/test', bills.injectRandomDateIntoDatabase)

var options = {
  key: fs.readFileSync('cert/server.key'),
  cert: fs.readFileSync('cert/server.crt')
};

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// https.createServer(options, app).listen(app.get('port'), function(){
//   console.log("Express server listening on port " + app.get('port'));
// });

