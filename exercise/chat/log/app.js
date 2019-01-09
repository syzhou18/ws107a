var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//new model
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');  
var upload = multer({dest: './uploads'}); // setup multer upload destination
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var server = require('http').createServer(app);

//create db connection using mongoose
var db = mongoose.connection;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
 //socket.io
const io = require('socket.io').listen(server);
io.on('connection', function(socket) {
 //新user
socket.on('add user',function(name){
		socket.username = name;
		console.log("new user:"+name+" logged.");
		usercount++;
		io.emit('add user',{username: socket.username});
  });
  
  //新訊息
socket.on('chat message', function(msg){

		console.log(socket.username+":"+msg);

		io.emit('chat message', {username:socket.username,msg:msg});

	});

	//left
socket.on('disconnect', function(msg){
		console.log(socket.username+" has left.");
		io.emit('left user',{username:socket.username});
	});
});
server.listen(3001);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(function(username, password, done){
  //compare username
  User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
          return done(null, false, {message: 'Unknown User'});
      }
      //compare password
      User.comparePassword(password, user.password, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
              return done(null, user);
          } else {
              return done(null, false, {message: 'Invalid Password'});
          }
      });

  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// validator驗證
app.use(expressValidator({
errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root    = namespace.shift()
    , formParam = root;

  while(namespace.length) {
    formParam += '[' + namespace.shift() + ']';
  }
  return {
    param : formParam,
    msg   : msg,
    value : value
  };
}
}));

// messages (express-messages / connect-flash)
app.use(require('connect-flash')());
app.use(function (req, res, next) {
res.locals.messages = require('express-messages')(req, res);
next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
