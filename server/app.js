var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var article = require('./routes/article');
var user = require('./routes/user')
var jwt = require('jsonwebtoken')
var secret = 'fang-SleepWalker'

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 允许跨域
// app.all('*', function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Headers', 'Content-Type, access-token, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderField')
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
//     next()
// })
app.use((req, res, next) => {
    let token = req.headers['access-token']
    // 验证header中的token是否过期 放弃验证cookies
    // if (req.cookies['User-Token']) {
    // console.log('cookies', req.cookies['User-Token'])
    // console.log('token', token)
    if (token) {
        // TODO 验证token是否过期
        jwt.verify(token, secret, function (err, decoded) {
            // token过期
            if (!decoded) {
                res.json({
                    status: '02',
                    msg: 'token过期,请重新登入',
                    result: ''
                })
            } else {
                // console.log('token 未过期')
                next()
            }
        })
    } else {
        // console.log('orginalUrl', req.originalUrl)
        // 如果是login发送的请求,可以通过
        console.log('original URL', req.originalUrl)
        if (req.originalUrl === '/api/login'){
            next()
        } else {
            res.json({
                status: '01',
                msg: '未登入, 这条信息应该不会出现',
                result: ''
            })
        }
    }
})
// app.use((req, res, next) => {
//     if(req.cookies.userId) {
//       next()
//     } else {
//         if (req.originalUrl === '/api/login' || req.originalUrl === '/api/logout') {
//             next()
//         } else {
//             res.json({
//                 status: '10001',
//                 msg: '当前未登入',
//                 result: ''
//             })
//         }
//     }
// })
// app.use('/', index);
app.use('/api', user);
app.use('/api', article);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
