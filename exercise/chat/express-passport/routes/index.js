var express = require('express');
var router = express.Router();

module.exports = function (passport) {
  router.get('/', function (req, res, next) {
    res.render('index', { message: req.flash('info') });
  })

  router.post('/signin', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  }));

  router.get('/signup', function (req, res, next) {
    res.render('signup', { message: req.flash('info') });
  });

  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  return router;
}