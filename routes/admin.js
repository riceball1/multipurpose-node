const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');

router.get('/settings', ensureAdmin, (req, res) => {
  res.render('admin');
});

router.post('/newitem', (req, res) => {
  const {itemName, imgSrc, shortDescription} = req.body;
  let newItem = new Item({
    itemName: itemName,
    imgSrc: '/public/'+imgSrc,
    shortDescription: shortDescription
  });
  newItem.save(function (err) {
    if (err) {
      return handleError(err);
    }
    req.flash('success_msg', "Successfully created new item!");
    res.redirect('/admin/settings');
  })
});

function ensureAdmin(req, res, next) {
  let admin = req.user.admin;
  if(req.isAuthenticated() && admin) {
    return next();
  } else {
    // req.flash('error_msg', 'You are not logged in');
    res.render('/dashboard');
  }
}

module.exports = router;
