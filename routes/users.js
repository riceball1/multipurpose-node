/** user.js route **/

const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');
const LocalStrategy = require('passport-local').Strategy;
// const flash = require('connect-flash');

router.use(passport.initialize());
// router.use(flash());
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
router.post('/register',
(req, res) =>{
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
        if(err) {
          res.render('register', {errors: 'There was an error.'});
        }
        console.log("User created!");
      });
      res.render('login', {success: 'Successfully created user account.'});
    }
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) {
      return done(err);
    }

   	if(!user){
   		return done(null, false, {message: 'Invalid username.'});
      }
  
   	User.comparePassword(password, user.password, function(err, isMatch){
   		 if (err) {return done(err);}
                
     		if(isMatch){
          return done(null, user);
        } else {
     			return done(null, false, {message: 'Invalid password'});
        }
   	});
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// POST login
router.post('/login',
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true,
    successFlash: true}));

// LOGOUT
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});


module.exports = router;
