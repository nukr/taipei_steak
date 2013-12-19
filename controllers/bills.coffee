models = require '../models'
async = require 'async'
moment = require 'moment'
util = require 'util'

Bill = models.Bill
Meal = models.Meal

# Morning to Evening
m2e = exports.m2e = (req, res) ->
  Bill.findByIdAndUpdate req.params.id, {shift: 'evening'}, ->
    res.json
      status: 'success'

# Evening to Morning
e2m = exports.e2m = (req, res) ->
  Bill.findByIdAndUpdate req.params.id, {shift: 'morning'}, ->
    res.json
      status: 'success'

test = exports.test = (req, res) ->

  Bill.find()
  .where('orderTime').gte(new Date('2013-05-31'))
  .where('orderTime').lt(new Date('2013-06-01'))
  .exec (err, bill) ->
    console.log bill

# 塞一些垃圾資料進資料庫
injectRandomDateIntoDatabase = exports.injectRandomDateIntoDatabase = (req, res) ->

  for day in [1..31]
    times = Math.round( Math.random() * 100 )
    for time in [1..times]
      credit = if ( Math.random() * 10 ) > 5 then true else false
      discount = if ( Math.random() * 10 ) > 5 then true else false
      shift = if ( Math.random() * 10 ) > 5 then 'morning' else 'evening'
      creator = if ( Math.random() * 10 ) > 5 then '呂立婷' else '羅葦'
      b = new Bill
        billNo: time
        credit: credit
        discount: discount
        dishes: [{name: 'OP', price: 680, quantity: Math.round( Math.random() * 10)}, {name: '美沙', price: 980, quantity: Math.round( Math.random() * 10 )}]
        shift: shift
        creator: creator
        orderTime: new Date("2013-05-#{day}")
      b.save (err, doc) ->
        if err then handleError err

genQuery = exports.genQuery = (dateObj, shift) ->
  d = convertDate(dateObj)
  query =
    orderTime:
      $gte: "#{d.today}"
      $lt: "#{d.tomorrow}"
    shift: shift

#日期轉換
convertDate = exports.convertDate = (date) ->

  convertedDate =
    year: moment(date).format("YYYY")
    month: moment(date).format("MM")
    day: moment(date).format("DD")
    today: moment(date).format("YYYY-MM-DD")
    tomorrow: moment(date).add('days', 1).format("YYYY-MM-DD")


# 客數統計表 by MapReduce
dishCount = exports.dishCount = (query, cb) ->
  o = {}

  o.query = query

  o.map = ->
    for dish in @dishes
      key = dish.name
      value =
        count: 1
        qty: dish.quantity
        price: dish.price
        total: dish.price * dish.quantity
      emit key, value

  o.reduce = (k, valuesCountObjects) ->
    reducedValue =
      count: 0
      price: 0
      qty: 0
      total: 0

    for obj in valuesCountObjects
      reducedValue.count += obj.count
      reducedValue.qty += obj.qty
      reducedValue.total += obj.total
      reducedValue.price = obj.price

    reducedValue

  Bill.mapReduce o, (err, results) ->
    results.overAll = 0
    for result in results
      results.overAll += result.value.total
    cb(results)


# 從資料庫撈取資料
queryBill = exports.queryBill = (dateObj, shift, cb) ->

  year = moment(dateObj).year()
  month = moment(dateObj).month() + 1
  date = moment(dateObj).date()

  todayStart = moment("#{year}-#{month}-#{date}")

  today = todayStart._d.toISOString()
  tomorrow = todayStart.add('day', 1)._d.toISOString()

  Bill.find()
  .where('orderTime').gte(today)
  .where('orderTime').lt(tomorrow)
  .where('shift').equals(shift)
  .sort('billNo')
  .lean()
  .exec (err, bill) ->
    if err then handleError err else cb bill

add = exports.add = () ->

# 商業邏輯
calculate = exports.calculate = (bills, cb) ->

  container = {}
  b = {}
  b.allDonePrice = 0
  b.allRawPrice = 0
  b.allServiceTip = 0
  b.allDiscountTip = 0
  b.allCreditServiceTip = 0
  b.allNonCreditServiceTip = 0
  b.allCreditPrice = 0
  b.allQty = 0
  b.totalTurnOver = 0 #營業總額 = 原始金額 - 折扣

  for bill in bills

    bill.rawPrice = 0
    bill.serviceTip = 0
    bill.discountTip = 0
    bill.donePrice = 0

    for dish in bill.dishes
      bill.rawPrice += dish.price * dish.quantity
      b.allQty += dish.quantity

    bill.serviceTip = Math.round(bill.rawPrice * 0.1)

    if bill.discount
      bill.discountTip = Math.round(bill.rawPrice - bill.rawPrice * 0.88)
      b.allDiscountTip += bill.discountTip

    bill.donePrice = bill.rawPrice - bill.discountTip + bill.serviceTip
    b.allDonePrice += bill.donePrice
    if bill.credit
      b.allCreditPrice += bill.donePrice
      b.allCreditServiceTip += bill.serviceTip

    b.allRawPrice += bill.rawPrice
    b.allServiceTip += bill.serviceTip

  b.totalTurnOver = b.allRawPrice - b.allDiscountTip
  b.cash = b.allDonePrice - b.allCreditPrice

  container.info = b
  container.bills = bills

  cb container

reportSpa = exports.reportSpa = (req, res) ->
  res.render 'report_spa'

checkout = exports.checkout = (req, res) ->
  today = new Date()
  queryBill today, req.session.user.shift, (bills) ->
    res.render 'checkout', {'title': '結帳', 'bills': bills, 'user': req.session.user}

report = exports.report = (req, res) ->
  today = new Date()
  queryBill today, req.session.user.shift, (bills) ->
    calculate bills, (cBills) ->
      console.log cBills
      res.render 'report', {'title': '報表', 'cBills': cBills, 'user': req.session.user}

reportApi = exports.reportApi = (req, res) ->
  r = req.params
  date = "#{r.year}-#{r.month}-#{r.day}"
  queryString = genQuery(new Date("#{r.year}-#{r.month}-#{r.day}"), r.shift)
  queryBill date, r.shift, (bills) ->
    calculate bills, (calculatedBills) ->
      dishCount queryString, (dishCountTable) ->
        o = {}
        o.c = calculatedBills
        o.dishCountTable = dishCountTable
        res.json o
