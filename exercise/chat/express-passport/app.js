var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt-nodejs');


// DB
var config = require('./db');
mongoose.connect(config.connection);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use('login', new LocalStrategy({
    passReqToCallback: true
  },
  function (req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err)
      }

      if (!user) {
        return done(null, false, req.flash('info', 'User not found.'))
      }

      var isValidPassword = function (user, password) {
        return bcrypt.compareSync(password, user.password)
      }

      if (!isValidPassword(user, password)) {
        return done(null, false, req.flash('info', 'Invalid password'))
      }

      return done(null, user)
    })
  }
));

passport.use('signup', new LocalStrategy({
  passReqToCallback: true
}, function (req, username, password, done) {
  var findOrCreateUser = function () {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }

      if (user) {
        return done(null, false, req.flash('info', 'User already exists'));
      } else {
        var newUser = new User();
        newUser.username = username;
        newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        newUser.email = req.params.email;
        newUser.firstname = req.params.firstname;
        newUser.lastname = req.params.lastname;

        newUser.save(function (err, user) {
          if (err) {
            throw err;
          }

          return done(null, user);
        });
      }
    });
  };

  process.nextTick(findOrCreateUser)
}));

var index = require('./routes/index');

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

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);

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