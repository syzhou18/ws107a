var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;





/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('index',{title: 'Chat'});
});

//加入register routing
router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

//加入login routing
router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.get('/index', function(req, res, next) {
  res.render('index', {title: 'Login'});
});

router.post('/register', upload.single('profileimage'), function(req, res, next) {
  //using multer
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  //Form Validator
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  //console.log(req.file); //show uploaded image info.
  if(req.file){
      console.log('Uploading File...');
      var profileimage = req.file.filename;
  } else {
      console.log('No File Uploaded...');
      var profileimage = 'noimage.jpg'; //use default image
  }

  var errors = req.validationErrors();
  
  if(errors){
      res.render('register', {
          errors: errors
      });
  } else {
      var newUser = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          profileimage: profileimage
      });

      User.createUser(newUser, function(err, user){
          //track for error
          if(err) throw err;
          console.log(user);
      });

      req.flash('success', 'You are now registered and can login');

      res.location('/users/login');
      res.redirect('/users/login');
  }
});
//登入驗證
router.post('/login',passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
    
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
  req.flash('success', 'You are now logged in');
  res.redirect('/');
  });

module.exports = router;
