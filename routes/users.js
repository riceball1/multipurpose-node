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

// Register User
router.post('/register', (req, res) =>{
  // Get all stuff being submitted and put into variable
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // Validation from expressValidator
  req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();
  if(errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });

    User.createUser(newUser, (err, user) => {
      if(err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now l ogin');

    res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, (err, user) => {
      if(err) throw err;
      if(!user) {
        return done(null, false, {message: 'unknown user'});
      }

      User.comparePassword(password, user.password, (err, isMatch) => {
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
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



router.post('/login',
passport.authenticate('local', {successRedirect:'/', failureRedirect: '/users/login', failureFlash: true}),
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
