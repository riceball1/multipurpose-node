const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');

// Get Homepage
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('index');
});

router.get('/forum', ensureAuthenticated, (req, res) => {
  res.render('forum');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    helpers: {
      items: function() {
        return Item.findOne({}, function(err, doc) {
          if(err) throw console.error();
          return doc
        });
      }
    }
  });
});

// use :term instead for actual search query
// issue with items with "two words"
router.get('/items/:item', ensureAuthenticated, (req, res) => {
  if(req.params.item) {
    Item.findOne({itemName: req.params.item}, function(err, docs) {
      if(err) throw Error;
      res.render('item', docs);
    });
  } else {
    req.flash('error_msg', 'Item not found.');
    res.redirect('/dashboard');
  }
});


router.get('/vinegar', ensureAuthenticated, (req, res) => {
  res.render('vinegar');
});

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    // req.flash('error_msg', 'You are not logged in');
    res.render('home', {layout: "main"});
  }
}

module.exports = router;
