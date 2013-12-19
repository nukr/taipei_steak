pwd = require 'pwd'
models = require '../models'
Employee = models.Employee

exports.index = (req, res) ->
  res.render 'auth', title: '登入'

exports.login = (req, res) ->
  password = ( req.body.password ).trim()
  Employee.findOne username: req.body.username, (err, user) ->
    if user is null
      console.log '使用者不存在'
      res.send status: 'user unavalible'
    else
      pwd.hash password, user.salt, (err, hash) ->
        if hash.toString('base64') is user.password
          req.session.user = {}
          req.session.user.login = true
          req.session.user.realname = user.realname
          req.session.user.username = user.username
          req.session.user.shift = req.body.shift
          console.log('登入成功')
          console.log(req.body.shift)
          res.redirect('/')
        else
          console.log "登入失敗\n"
          res.json status: 'login failure'

exports.logout = (req, res) ->
  req.session = null
  res.redirect '/'

