const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

router.use(passport.initialize());

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
router.post('/register', (req, res) =>{
  // Get all stuff being submitted and put into variable
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // Validation from expressValidator
  // req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	// req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	// req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();
  if(errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    const newUser = new User({
      // name: name,
      email: email,
      // username: username,
      password: password
    });

    User.createUser(newUser, (err, user) => {
      if(err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/login');
  }
});

router.post('/login',
passport.authenticate('local-login', {
  successRedirect:'/',
  failureRedirect: '/login',
  failureFlash: true}),
(req, res) => {
  // authentication was successful
  // req.user contains the authenticated user
  res.redirect('/users' + req.user.username);
});

router.get('/logout', (req, res) =>{
  req.logout();
  req.flash('success_msg', 'You are logged out');

  res.redirect('/login');
});


module.exports = router;
