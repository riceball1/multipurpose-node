const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({
  handlebars: handlebars
});
const mongoose = require('mongoose');

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
  const id = req.user._id;
  // declare variables
  let tipsdata;
    // find info by user
    User.findById({_id: id}, (err, user) => {
      // get user data;
      let tipsId = user.tipIdArray;
      let bookmarks = user.itemIdArray;
      let bookmarkData = [];
      // search for tipsdata
        Tip.find({_id: {$in: tipsId}}, (err, data) => {
          if(err) {
            console.error('There was an error: ' + err);
            res.render('dashboard', {
              user: user
            });
          }
          tipsdata = data;
        })
        .then(() => {
          Item.find({_id: {$in: bookmarks}}, (err, items) =>{
            if(err) {
              console.log('Item not found');
              res.render('dashboard', {
                user: user,
                tips: tipsData
              });
            }
          bookmarkData = items;
          });
      }) // end of first then()
        .then(()=> {
          res.render('dashboard', {
            user: user,
            tips: tipsdata,
            bookmarks: bookmarkData
          }) // end of render
        }); // end of second then()
   }) // end of User.findById 
    .catch(() => {
      console.error('There was an error finding user info');
      res.render('dashboard', user);
    }) // end of catch 
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
      console.log(item);
      res.render('item', item);
    });
  } else {
    req.flash('error_msg', 'Item not found.');
    res.redirect('/dashboard');
  }
});

// Bookmark an item and add to user's doc
router.post('/items/:itemid/bookmark', ensureAuthenticated, (req, res) => {
  let itemid = req.params.itemid;
  let userid = req.user._id;
  let noItem;
    User.findById({_id: userid}, (err, user) => {
      if(err || !user) {
        console.log("There was an error: " + err);
        res.redirect('/dashboard');
      }
      const itemidParsed = mongoose.Types.ObjectId(itemid);
      // TODO: Check tipIdArray so you only push it once!!
      // Search if user already has item bookmarked
      User.findOne({itemIdArray: itemidParsed}, (err, item) =>{
        if(err) {
          req.flash("error_msg", `There was an error: ${err}`);
          res.redirect('/dashboard');
        }
        // item does not exists
        if(item === null) {
          noItem = true;
        } else {
          noItem = false;
        }
      }) // end of search for bookmarked item in User
      .then(() => {
        // if item has not been bookmarked, bookmark it
        if(noItem) { 
          User.update({_id: userid}, {$push: {itemIdArray: itemidParsed}}, (err, updatedUser) => {
            if(err) {
              req.flash("error_msg", `There was an error: ${err}`);
              return res.redirect('/dashboard');
            } 
            req.flash('success_msg', 'Successfully bookmarked item!');
            console.log("Successfully bookmarked item!");
            res.redirect('/items/'+itemid);
          });
        }  else {
          req.flash('error_msg', 'Item already bookmarked');
          console.log("Item already bookmarked");
          res.redirect('/items/'+itemid);
        }
        
        
      }) // end of first then()
    }) // end of User.findById()
    .catch((err) => {
      req.flash("error_msg", `There was an error: ${err}`);
      res.redirect('/dashboard');
    });
  });


// POST - add tip from items page
router.post('/items/:itemid/addtip', (req, res) => {
  let content = req.params.content;
  let userId = req.user._id;
  let itemId =  req.params.itemid;
  let itemsPage = '/items/'+itemId;
  let tipId;
  User.findById({_id: userId}, function(err, user) {
    // Have the user.
    if(err || !user) {
      console.log("There was an error: " + err);
      res.redirect('/dashboard');
    }

    let newTip = new Tip({
      userId: userId,
      content: content,
      itemId: itemId
    });
    // save newTip
    newTip.save(function(err) {
      if(err) {
       req.flash('error_msg', 'There was an error');
        res.redirect(itemsPage); // TODO
      }
      console.log("Successfully saved new tip");
    });
    tipId = newTip._id;
      })
    .then(()=> {
      console.log(tipId);
       User.update({_id: userId}, {$push: {tipIdArray: tipId}}, (err, updatedUser) => {
        if (err) {
          req.flash('error_msg', 'There was an error');
          res.redirect(itemsPage);
        }
      });

      Item.update({_id: itemId}, {$push: {tipIdArray: tipId}}, (err, updatedUser) => {
        if (err) {
          req.flash('error_msg', 'There was an error');
          res.redirect(itemsPage);
        }
      });
      req.flash('success_msg', 'Successfully added tip!');
      res.redirect(itemsPage);
    })
  .catch((err) => {
    req.flash("error_msg", `There was an error: ${err}`);
    res.redirect(itemsPage);
  });
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
