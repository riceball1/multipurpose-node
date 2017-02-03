const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');

// Get Homepage
router.get('/', ensureAuthenticated, (req, res) => {
    Item.find({}).limit(4).exec(function(err, items) {
      let itemArray = [];
      items.forEach(function(item) {
        itemArray.push(item);
      });
      res.render('index', {
        items: itemArray
      });
    });
});

router.get('/forum', ensureAuthenticated, (req, res) => {
  res.render('forum');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  const id = req.user._id;
  if(id) {
    User.getUserById(id, function(err, user) {
      let tipsId = user.tipIdArray;
      Tip.find({'_id': { $in: tipsId} }, function(err, tipsData) {
        // if(err) {
        //   console.error(Error);
        // }
        res.render('dashboard', {
          user: user,
          tips: tipsData
        });
      });
    });
  } else {
    req.flash('error_msg', 'No user ID.');
    res.redirect('/');
  }
});

router.post('/search', (req, res) => {
  let query = req.body.item;
  Item.find({itemName: query}).exec().then(function(itemData) {
    console.log(itemData[0]);
    Tip.find({'_id': { $in: itemData[0].tipIdArray}}, function(err, tipsData) {
      if(err) {
        res.send("item not found.");
        res.redirect('/dashboard');
      }
      res.render('item', {
        itemName: itemData[0].itemName,
        imgSrc: itemData[0].imgSrc,
        shortDescription: itemData[0].shortDescription,
        tips: tipsData
      });
    })
  });
});

// item by page
router.get('/items/:itemid', ensureAuthenticated, (req, res) => {
  if(req.params.itemid) {
    Item.findOne({_id: req.params.itemid}, function(err, item) {
      console.log(item);
      if(err) {
        req.flag('error_msg', "Item not found.");
        res.redirect('/dashboard');
      };
      res.render('item', item);
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
