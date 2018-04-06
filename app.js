var createError = require('http-errors');
var express = require('express');
var mongoose = require('mongoose');
require('./models/user');
require('./models/message');
require('./models/workspace');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var moment = require('moment');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

const assert = require('assert');

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

var db_config = require('./config/db');
mongoose.connect(db_config.url);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected successfully to server')
});


var user = mongoose.model('users');
var generalMessage = mongoose.model('generalMessages');
var workspace = mongoose.model('workspaces');

app.post('/login', (req, res, next) => {
  var login_user = {
    workspace: req.body.workspaceId,
    email: req.body.email,
    password: req.body.password
  }
  user.find(login_user, function (err, user) {
    var error = new Error();
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
  var register_user = new user({
    name: req.body.name,
    workspace: req.body.workspace,
    email: req.body.email,
    password: req.body.password
  });
  user.find({email: register_user.email, workspace: register_user.workspace}, function (err, user) {
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
        workspace.find({name: register_user.workspace}, function (err, ws) {
          if (err) nex(err);
          if (!ws[0]) {
            error.name = 'BadRequest';
            error.message = 'Workspace does not exist.';
            error.status = 400;
            next(error);
          } else {
            var updated_users = ws[0].users;
            updated_users.push(user._id);
            ws[0].set({users: updated_users});
            ws[0].save(function (err, updated_ws) {
              if (err) next(err);
              res.send(user);            
            })
          }
        })
      });
    }
  })
});

app.get('/reset', (req, res, next) => {  

  var error = new Error();
  
  var forget_user = {
    email: req.query.email,
  }

  user.find(forget_user, function (err, user) {
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

app.get('/message', (req, res, next) => {  
  
  var error = new Error();
  var create_date = {
    "date": {
      "$gte" : new Date(Date.now() - 7 * 24 * 3600 * 1000),
      "$lte" : new Date()
    }
  };

  generalMessage.find(create_date, function (err, msgs) {
    if (err) next(err);
    if (msgs) {
      res.send(msgs);
    } else {
      error.name = 'BadRequest';
      error.message = 'User does not exist';
      error.status = 400;
      next(error);
    }
  })
})

app.get('/users', (req, res, next) => {
  var error = new Error();

  user.find({}, function (err, user) {
    if (err) next(err);
    if (user) {
      res.send(user);
    } else {
      error.name = 'BadRequest';
      error.message = 'Users does not exist';
      error.status = 400;
      next(error);
    }
  })
})

app.get('/init_workspaces', (req, res, next) => {
  var error = new Error();

  workspace.find({}, function (err, lists) {
    if (err) next(err);
    if (lists) {
      res.send(lists);
    } else {
      error.name = 'BadRequest';
      error.message = 'Workspace does not exist';
      error.status = 400;
      next(error);
    }
  })
})

app.post('/create_workspace', (req, res, next) => {
  var error = new Error();
  
  workspace.find({name: req.body.name}, function (err, ws) {
    if (err) next(err);
    if (ws[0]) {
      error.name = 'BadRequest';
      error.message = 'Workspace already exsit';
      error.status = 400;
      next(error);
    } else {
      var admin = new user({
        name: 'admin',
        workspace: req.body.name,
        email: req.body.admin,
        password: req.body.password
      });
      admin.save(function (err, admin_user) {
        if (err) {
          error.name = 'BadRequest';
          error.message = 'Admin register is failed.';
          error.status = 400;
          next(error);
        }
        var worksp = new workspace({
          name: req.body.name,
          fullName: req.body.fullName,
          admin: admin_user._id,
          users: admin_user._id
        })
        worksp.save(function (err, wp) {
          if (err) {
            error.name = 'BadRequest';
            error.message = 'Workspace register is failed.';
            error.status = 400;
            next(error);
          }
          res.send(wp);
        })
      })
    }
  })  
})

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

function getDBContext() {
  return db;
}

module.exports = {
  app: app,
  getDBContext: getDBContext
};
