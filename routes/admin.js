const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');

router.get('/settings', ensureAdmin, (req, res) => {
  res.render('admin');
});

// Tip.findByIdandRemove(id).exec();
// User.update <-- a form to update password
// update username, email


router.post('/newitem', (req, res) => {
  const {itemName, imgSrc, shortDescription} = req.body;
  // validatior
  req.checkBody('itemName', 'Name is required').notEmpty();
  req.checkBody('imgSrc', 'Image Src is required, ex. sugar.jpg').notEmpty();
  req.checkBody('shortDescription', 'Please include a short description').notEmpty();

  let newItem = new Item({
    itemName: itemName,
    imgSrc: '/public/'+imgSrc,
    shortDescription: shortDescription
  });
  newItem.save(function (err) {
    if (err) {
      return handleError(err);
    }
    res.render('admin');
  })
});

router.post('/addtip', (req, res) => {
  
});

function ensureAdmin(req, res, next) {
  let admin = req.user.admin;
  if(req.isAuthenticated() && admin) {
    return next();
  } else {
    res.render('/dashboard');
  }
}

module.exports = router;
