var createError = require('http-errors');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// const url = 'mongodb://users:user1992@ds157723.mlab.com:57723/userauth';
// const dbName = 'userauth';

// MongoClient.connect(url, function(err, client) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");
 
//   var db = client.db(dbName);
 
//   client.close();
// });

var db_config = require('./config/db');
mongoose.connect(db_config.url);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected successfully to server')
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var loginSchema = mongoose.Schema({
  email: String,
  password: String
});

var registerSchema = mongoose.Schema({
  email: String,
  password: String
});

var login = mongoose.model('users', loginSchema);

app.post('/login', (req, res, next) => {
  var login_user = {
    email: req.body.email,
    password: req.body.password
  }
  login.find(login_user, function (err, user) {
    if (err) {
      error.name = 'BadRequest';
      error.message = 'The login is failed.';
      error.status = 400;
      next(error); 
    }
    if (user[0]) {
      res.send(user);
    } else {
      error.name = 'BadRequest';
      error.message = 'User does not exists.';
      error.status = 404;
      next(error); 
    }
  })
});

app.post('/register', (req, res, next) => {
  var error = new Error();
  var register_user = new login({
    email: req.body.email,
    password: req.body.password
  });
  login.find({email: register_user.email}, function (err, user) {
    if (err) nex(err);
    if (user[0]) {
      error.name = 'BadRequest';
      error.message = 'User alrady exists.';
      error.status = 400;
      next(error);      
    } else {
      register_user.save(function (err, user) {
        if (err) {
          error.name = 'BadRequest';
          error.message = 'User register is failed.';
          error.status = 400;
          next(error);
        }
        res.send(user)
      });
    }
  })
});

app.get('/reset', (req, res, next) => {  

  var error = new Error();
  
  var forget_user = {
    email: req.query.email,
  }

  login.find(forget_user, function (err, user) {
    if (err) next(err);
    if (user[0]) {
      res.send(user);
    } else {
      error.name = 'BadRequest';
      error.message = 'User does not exist';
      error.status = 400;
      next(error);
    }
  })
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
