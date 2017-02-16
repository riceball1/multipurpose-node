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
  // validatior
  req.checkBody('itemName', 'Name is required').notEmpty();
  req.checkBody('imgSrc', 'Image Src is required, ex. sugar.jpg').notEmpty();
  req.checkBody('shortDescription', 'Please include a short description').notEmpty();

    const errors = req.validationErrors();
    if(errors) {
      res.render('admin', {
        errors: errors
      });
    }  else {
      let newItem = new Item({
      itemName: itemName,
      imgSrc: '/public/images/'+imgSrc,
      shortDescription: shortDescription
      });
      newItem.save(function (err) {
        if (err) {
          console.error("There was an error: " +err);
        res.render('admin');
        }
        req.flash("success", "New tip added successfully!");
        res.render('admin');
      })
    }
  
});

router.post('/addtip', (req, res) => {
  const {userId, itemId, content} = req.body;
  let newTip = new Tip({
    userId: userId,
    content: content,
    itemId: itemId
  });
  // save newTip
  newTip.save(function(err) {
    if(err) {
      console.error("There was an error: " +err);
      res.render('admin');
    }
    // push tipId to User's tipIdArray
    User.update({_id: userId}, {$push: {tipIdArray: newTip._id}});
    Item.update({_id: itemId}, {$push: {tipIdArray: newTip._id}});
    req.flash("success_msg", "New tip added successfully!");
    res.render('admin');
  });
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
