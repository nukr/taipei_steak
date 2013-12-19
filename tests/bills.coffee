describe 'jasmine-node', ->

  it 'should pass', ->
    expect(1+2).toBe(3)
  it 'should pass true is toBe true', ->
    expect(true).toEqual(true)

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
