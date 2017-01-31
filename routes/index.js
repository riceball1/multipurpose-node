const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Get Homepage
router.get('/', ensureAuthenticated, function(app, passport, req, res, next) {
  res.render('index');
});

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    // req.flash('error_msg', 'You are not logged in');
    res.render('home');
  }
}

router.get('/login', passport.authenticate('LocalStrategy', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// use :term instead for actual search query
router.get('/vinegar', (req, res) => {
  res.render('vinegar');
});

module.exports = router;
