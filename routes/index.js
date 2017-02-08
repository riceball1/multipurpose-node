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
    // find info by user
    User.findById({_id: id}, (err, user) => {
      // get user data;
      let tipsId = user.tipIdArray;
      let bookmarks = user.itemIdArray;
      let bookmarkData = [];
      let tipsData;
      // search for tipsdata
        Tip.find({_id: {$in: tipsId}}, (err, data) => {
          if(err) {
            console.error('There was an error: ' + err);
            res.render('dashboard', {
              user: user
            });
          }
          tipsData = data;
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
              return items
            }).then((items)=> {
              console.log("This is Item.find()", items);
              bookmarkData = items;
              console.log("This is 1st bookmarkData: " + bookmarkData);
              console.log("This is bookmarkData", bookmarkData);
              console.log("This is tips data: ", tipsData);
              req.flash('success_msg', 'dashboard loaded');
              res.render('dashboard', {
                user: user,
                tips: tipsData,
                bookmarks: bookmarkData
              }); // end of render
            });// end of Item.find()
        }); // end of first then()
   }) // end of User.findById 
    .catch(() => {
      console.error('There was an error finding user info');
      res.render('dashboard', user);
    }) // end of catch 
});

// POST - Query item
router.post('/search', (req, res) => {
  let query = req.body.item;
  Item
  .find({itemName: query})
  .exec()
  .then(function(itemData) {
    if(itemData[0] === undefined) {
      req.flash('error_msg', 'Item does not exist.');
      res.redirect('/');
    }
    Tip.find({'_id': { $in: itemData[0].tipIdArray}}, function(err, tipsData) {
      if(err) {
        console.log('Item not found');
        res.redirect('/dashboard');
      }
      res.render('item', {
        _id: itemData[0]._id,
        itemName: itemData[0].itemName,
        imgSrc: itemData[0].imgSrc,
        shortDescription: itemData[0].shortDescription,
        tips: tipsData
      }); // end of render
    }); // end of Tip.find() 
  })// end of then()
  .catch( (err) => {
    req.flash('error_msg', 'Error searching for item');
    res.redirect('/');
  });
});// end of router.post()

// GET - Individual item page
router.get('/items/:itemid', ensureAuthenticated, (req, res) => {
  if(req.params.itemid) {
    Item.findById({_id: req.params.itemid}, function(err, item) {
      if(err) {
        req.flag('error_msg', "Item not found.");
        res.redirect('/dashboard');
      };
      let itemTipArray = item.tipIdArray;
      Tip.find({_id: {$in: itemTipArray}}, (err, tipResults) => {
        console.log(tipResults);
      });
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
  
    User.findById({_id: userid}, (err, user) => {
      if(err || !user) {
        console.log("There was an error: " + err);
        res.redirect('/dashboard');
      }
      const itemidParsed = mongoose.Types.ObjectId(itemid);
      const userArray = user["itemIdArray"];
      let containsItem = false;
    
      // check if item is inside of array
      for (var i = 0; i < userArray.length; i++) {
        // console.log(userArray[i]);
        if(String(userArray[i]) ===  String(itemidParsed)) {
          containsItem = true;
          break;
        }
      }

      if(!containsItem) { // if false turn true to push itemid
        User.update({_id: userid}, {$push: {itemIdArray: itemidParsed}}, (err, updatedUser) => {
          if(err) {
            req.flash("error_msg", `There was an error: ${err}`);
            return res.redirect('/dashboard');
          } 
          req.flash('success_msg', 'Successfully bookmarked item!');
          console.log("Successfully bookmarked item!");
          res.redirect('/items/'+itemid);
        });
      } else {
        req.flash('error_msg', 'Item already bookmarked!');
        console.log("Item already bookmarked!");
        res.redirect('/items/'+itemid);
      }
    }) // end then()
    .catch((err) => {
      req.flash("error_msg", `There was an error: ${err}`);
      res.redirect('/dashboard');
    });
  });

// POST - add tip from items page
router.post('/items/:itemid/addtip', (req, res) => {
  let content = req.body.content;
  console.log(content);
  let userId = req.user._id;
  let itemId =  req.params.itemid;
  let itemsPage = '/items/'+itemId;
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
      let tipId = newTip._id;
    })
    .then((tipId)=> {
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
