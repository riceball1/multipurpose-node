const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');

router.get('/admin', ensureAdmin, (req, res) => {
  res.render('admin');
});

function ensureAdmin(req, res, next) {
  let id = req.user._id;
  if(req.isAuthenticated() && User.findOne({_id}).admin) {
    return next();
  } else {
    // req.flash('error_msg', 'You are not logged in');
    res.render('/dashboard');
  }
}

module.exports = router;
