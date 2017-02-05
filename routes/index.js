const express = require('express');
const events = require('events')
const emitter = new events.EventEmitter()
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({
  handlebars: handlebars
});

/** Emitter Events **/

emitter.on('test', () => {
  console.log("This is working!");
});



// GET Homepage
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

// GET FORUM - place for discussion
router.get('/forum', ensureAuthenticated, (req, res) => {
  res.render('forum');
});

// GET DASHBOARD - current user's
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  emitter.emit('test');
  const id = req.user._id;
  if(id) {
      User.findById({_id: id}, function(err, user) {
        let tipsId = user.tipIdArray;
        let bookmarks = user.itemIdArray;
      Tip.find({'_id': { $in: tipsId} }, (err, tipsData) => {
        if(err) {
          console.error('There was an error: ' + err);
          res.redirect('/dashboard');
        }
        console.log(bookmarks);
        res.render('dashboard', {
          user: user,
          tips: tipsData,
          bookmarks: bookmarks
        });
      });
    });
  } else {
    req.flash('error_msg', 'No user ID.');
    res.redirect('/');
  }
});

// POST - Query item
router.post('/search', (req, res) => {
  let query = req.body.item;
  Item.find({itemName: query}).exec().then(function(itemData) {
    console.log(itemData[0]);
    Tip.find({'_id': { $in: itemData[0].tipIdArray}}, function(err, tipsData) {
      if(err) {
        console.log('Item not found');
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

// GET - Individual item page
router.get('/items/:itemid', ensureAuthenticated, (req, res) => {
  if(req.params.itemid) {
    Item.findById({_id: req.params.itemid}, function(err, item) {
      // console.log(item);
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

// Bookmark an item and add to user's doc
router.post('/items/:itemid', ensureAuthenticated, (req, res) => {
  let itemid = req.params.itemid;
  let bookmarkStatus = req.body.status;
  let userid = req.user._id;
  if(bookmarkStatus === "bookmark") {
    User.findById({_id: userid}, function(err, user) {
      if(err) {
        console.log("There was an error: " + err);
        res.redirect('/dashboard');
      }
      console.log(itemid);
      User.update({_id: userid}, {$push: {itemIdArray: itemid}});
      // console.log(User.findById({_id: userid}));
      console.log("Successfully bookmarked item!");
    });
    res.redirect('/items/'+itemid);
  }
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
