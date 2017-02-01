const express = require('express');
const router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('index');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard');
});

// use :term instead for actual search query
router.get('/vinegar', ensureAuthenticated, (req, res) => {
  res.render('vinegar');
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
