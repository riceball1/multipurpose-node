const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');

// Get Homepage
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('index');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', Item);
});

// use :term instead for actual search query
router.get('/vinegar', ensureAuthenticated, (req, res) => {
  console.log(req.params);
  res.render('vinegar', {
    helpers: {
      foo: function (req) {
        return req; }
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    // req.flash('error_msg', 'You are not logged in');
    res.render('home');
  }
}

module.exports = router;
