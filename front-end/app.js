var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')
// var usersRouter = require('./routes/users');
//导入trafficRouter和usersRouter路由
var usersRouter = require('./routes/common')
var trafficRouter = require('./routes/traffic')

var app = express()

// view engine setup
//这里设置模板文件存放的目录，html就是要放在views，ejs和html都是模板引擎，同等地位
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
//这里设置网站的根目录，所以js、css、html这些都放在public目录下
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
// app.use('/users', usersRouter)
//导入productsRouter路由
app.use('/', usersRouter)
app.use('/', trafficRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
