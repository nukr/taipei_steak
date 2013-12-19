bills = require "../controllers/bills.js"
moment = require "moment"
models = require "../models"

Bill = models.Bill
Meal = models.Meal

describe 'convertDate', ->

  it 'today', ->
    today = new Date()
    queryDate = bills.convertDate(today)
    expect(queryDate.year).toEqual(moment(today).format("YYYY"))
    expect(queryDate.month).toEqual(moment(today).format("MM"))
    expect(queryDate.day).toEqual(moment(today).format("DD"))
    expect(queryDate.tomorrow).toEqual(moment(today).add('days', 1).format("DD"))

  it 'Feb28', ->
    someday = new Date('2013-02-28')
    queryDate = bills.convertDate(someday)
    expect(queryDate.year).toEqual(moment(someday).format("YYYY"))
    expect(queryDate.month).toEqual(moment(someday).format("MM"))
    expect(queryDate.day).toEqual(moment(someday).format("DD"))
    expect(queryDate.tomorrow).toEqual(moment(someday).add('days', 1).format("DD"))

describe 'queryBill', ->
  beforeEach () ->
    b = new Bill
      billNo: 3345678
      orderTime: new Date('1970-01-01')
    b.save (err, doc) ->
      if err then handleError else doc

  afterEach () ->
    Bill.remove
      billNo: 3345678
      (err ,affectedRow) ->
        if err then handleError else affectedRow

  container = {}

  it 'testDB', ->
    runs ->
      bills.query new Date('1970-01-01'), (bill) ->
        container.bill = bill

    waitsFor ->
      container.bill
    , "the value", 750

    runs ->
      expect(container.bill.length).toEqual(1)





# describe '測試網頁是否存在：', ->
# 
#   it "index", (done) ->
#     request "http://localhost:3000", (error, response, body) ->
#       expect(response?.statusCode).toEqual(200)
#       done()
# 
#   it "/create", (done) ->
#     request "http://localhost:3000/create", (error, response, body) ->
#       expect(response?.statusCode).toEqual(200)
#       done()
# 
#   it "/clean", (done) ->
#     request "http://localhost:3000/clean", (error, response, body) ->
#       expect(response?.statusCode).toEqual(200)
#       done()
