const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Register
router.get('/register', (req, res) => {
  res.render('register');
});

// Login
router.get('/login', (req, res) => {
  res.render('login');
});

// Home - not logged in main page
router.get('/home', (req, res) => {
  res.render('home');
});

// Register User
router.post('/register', passport.authenticate('local-signup', {
  successRedirect: '/dashboard',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.post('/login',
passport.authenticate('local-login', {
  successRedirect:'/',
  failureRedirect: '/users/login',
  failureFlash: true}),
(req, res) => {
  // authentication was successful
  // req.user contains the authenticated user
  res.redirect('/users' + req.user.username);
});

router.get('/logout', (req, res) =>{
  req.logout();
  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});


module.exports = router;
