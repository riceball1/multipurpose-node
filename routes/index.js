const express = require('express');
const router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, (req, res) => {
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

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// use :term instead for actual search query
router.get('/vinegar', (req, res) => {
  res.render('vinegar');
});

module.exports = router;
