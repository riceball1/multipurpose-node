const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Item = require('../models/item');
const Tip = require('../models/tip');
const Forum = require('../models/forum');
// const handlebars = require('handlebars');
const mongoose = require('mongoose');

// GET Homepage
router.get('/', (req, res) => {
    Item
        .find({})
        .limit(6)
        .exec((err, items) => {
            let itemArray = [];
            items.forEach(function(item) {
                itemArray.push(item);
            });
            res.render('index', {
                items: itemArray,
                layout: 'no-search'
            });
        });
});

// GET FORUM - place for discussion
router.get('/forum', ensureAuthenticated, (req, res) => {
    Forum.find({}, (err, forum) => {
            if (err) {
                req.flag('error', 'There was an error.');
                res.redirect('/');
            }
            res.render('forum', {
                forum: forum
            });
        })
        .catch((err) => {
            req.flag('error', 'There was an error.');
            res.redirect('/');
        });
});

// POST FORUM - add suggestions
router.post('/suggestions', ensureAuthenticated, (req, res) => {
    const content = req.body.content;
    const userId = req.user._id;
    const subject = req.body.subject;


    req.checkBody('subject', 'subject is required').notEmpty();
    req.checkBody('content', 'content is required').notEmpty();


    const errors = req.validationErrors();
    if (errors) {
        let errorMsg = [];
        errors.forEach(err => {
            errorMsg.push(err.msg);
        });

        req.flash('error_msg', errorMsg);
        res.redirect('/forum')
    } else {
        User.findById({ _id: userId }, (err, user) => {

            const newSuggestion = new Forum({
                userId: userId,
                content: content,
                userName: user.name,
                subject: subject
            });

            newSuggestion.save(function(err) {
                if (err) {
                    req.flash('errors', 'There was an error');
                    res.redirect('/forum');
                }
                console.log("Successfully saved new suggestion");
            });

            req.flash('success', 'Successfully saved new suggestion!');
            console.log("Successfully saved new suggestion");
            res.redirect('/forum');
        }).
        catch((err) => {
            req.flash('errors', 'There was an error');
            res.redirect('/forum');
        });
    }
});



// GET DASHBOARD - current user's
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    const id = req.user._id;

    User.findById({ _id: id }, (err, user) => {

            let tipsId = user.tipIdArray;
            let bookmarks = user.itemIdArray;
            let bookmarkData = [];

            Tip.find({ _id: { $in: tipsId } }, (err, tipsData) => {
                    if (err) {
                        console.error('There was an error: ' + err);
                        res.render('dashboard', {
                            user: user
                        });
                    }
                    return tipsData;
                })
                .then((tipsData) => {
                    Item.find({ _id: { $in: bookmarks } }, (err, items) => {
                        if (err) {
                            console.log('Item not found');
                            res.render('dashboard', {
                                user: user,
                                tips: tipsData
                            });
                        }
                        return items
                    }).then((items) => {
                        bookmarkData = items;
                        req.flash('success_msg', 'dashboard loaded');
                        res.render('dashboard', {
                            user: user,
                            tips: tipsData,
                            bookmarks: bookmarkData
                        });
                    });
                });
        })
        .catch((err) => {
            console.error('There was an error finding user info');
            res.render('dashboard', user);
        })
});

// POST - Query item
router.post('/search', (req, res) => {
    let query = req.body.item;
    console.log(query);
    Item
        .find({ itemName: query })
        .exec()
        .then(function(itemData) {
            if (itemData[0] === undefined) {
                req.flash('error', 'Item does not exist.');
                res.redirect('/');
            }
            console.log(itemData[0].tipIdArray);
            let itemInfo = itemData[0];
            Tip.find({ '_id': { $in: itemData[0].tipIdArray } }, function(err, tipsData) {
                if (err) {
                    console.log('Item not found');
                    res.redirect('/dashboard');
                }
                res.render('item', {
                    item: itemInfo,
                    tipData: tipsData
                });
            });
        })
        .catch((err) => {
            req.flash('error', 'Error searching for item');
            res.redirect('/');
        });
});

// GET - Individual item page
router.get('/items/:itemid', (req, res) => {
    const itemId = req.params.itemid;
    Item.findById({ _id: itemId }, function(err, item) {
            if (err) {
                req.flag('error', "Item not found.");
                res.redirect('/dashboard');
            };
            let itemTipArray = item.tipIdArray;
            let tipResults;
            Tip.find({ _id: { $in: itemTipArray } }, (err, results) => {
                if (err) {
                    req.flash('error', 'There was an error');
                    res.redirect('/');
                }
                tipResults = results;
                res.render('item', {
                    item: item,
                    tipData: tipResults
                });
            });
        }) // end of Item.findById()
        .catch((err) => {
            req.flash('error', 'Item not found.');
            res.redirect('/dashboard');
        }); // end of catch()
});

// Bookmark an item and add to user's doc
router.post('/items/:itemid/bookmark', ensureAuthenticated, (req, res) => {
    let itemid = req.params.itemid;
    let userid = req.user._id;

    User.findById({ _id: userid }, (err, user) => {
            if (err || !user) {
                console.log("There was an error: " + err);
                res.redirect('/dashboard');
            }
            const itemidParsed = mongoose.Types.ObjectId(itemid);
            const userArray = user["itemIdArray"];
            let containsItem = false;

            // check if item is inside of array
            for (var i = 0; i < userArray.length; i++) {
                // console.log(userArray[i]);
                if (String(userArray[i]) === String(itemidParsed)) {
                    containsItem = true;
                    break;
                }
            }

            if (!containsItem) { // if false turn true to push itemid
                User.update({ _id: userid }, { $push: { itemIdArray: itemidParsed } }, (err, updatedUser) => {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/dashboard');
                    }
                    req.flash('success', 'Successfully bookmarked item!');
                    res.redirect('/items/' + itemid);


                });
            } else {
                req.flash('error', 'Item already bookmarked!');
                res.redirect('/items/' + itemid);


            }
        }) // end then()
        .catch((err) => {
            req.flash('error', err);
            res.redirect('/dashboard');
        });
});

// POST - add tip from items page
router.post('/items/:itemid/addtip', ensureAuthenticated, (req, res) => {
    let content = req.body.content;
    let userId = req.user._id;
    let itemId = req.params.itemid;
    let itemsPage = '/items/' + itemId;
    User.findById({ _id: userId }, function(err, user) {
            // Have the user.
            if (err || !user) {
                console.log("There was an error: " + err);
                res.redirect('/dashboard');
            }

            let newTip = new Tip({
                userId: userId,
                content: content,
                itemId: itemId,
                userName: user.name
            });
            // save newTip
            newTip.save(function(err) {
                if (err) {
                    req.flash('error', 'There was an error saving new tip');
                    res.redirect(itemsPage); // TODO
                }
                req.flash('success', 'successfully saved new tip');
                console.log("Successfully saved new tip");
            });

            let tipId = mongoose.Types.ObjectId(newTip._id);

            User.update({ _id: userId }, { $push: { tipIdArray: tipId } }, (err, updatedUser) => {
                if (err) {
                    req.flash('error', 'There was an error updating database');
                    res.redirect(itemsPage);
                }
            });

            Item.update({ _id: itemId }, { $push: { tipIdArray: tipId } }, (err, updatedUser) => {
                if (err) {
                    req.flash('error', 'There was an error updating database');
                    res.redirect(itemsPage);
                }
            });
            req.flash('success', 'Successfully added tip!');
            res.redirect(itemsPage);
        })
        .catch((err) => {
            req.flash('error', `There was an error: ${err}`);
            res.redirect(itemsPage);
        });
});

// POST like votes
router.post('/:tipid/upvote', ensureAuthenticated, (req, res) => {
    Tip.findById(req.params.tipid, function(err, tip) {
        let itemid = tip.itemId;
        tip.upvote++;
        tip.save(function(err) {
            if (err) {
                req.flash('error', 'Tip voting not working');
                res.redirect('/items/' + itemid);
            }
            res.json(tip);
        });
    });
});

// POST dislike votes
router.post('/:tipid/downvote', ensureAuthenticated, (req, res) => {
    Tip.findById(req.params.tipid, function(err, tip) {
        let itemid = tip.itemId;
        tip.downvote++;
        tip.save(function(err) {
            if (err) {
                req.flash('error', 'Tip voting not working');
                res.redirect('/items/' + itemid);
            }
            res.json(tip);
        });
    });
});

// PUT to delete and remove tip from Item, User, Tip collections
// should be able to remove userid and use req.user._id instead
router.put('/:tipid/:userid/:itemid/deletetip', (req, res) => {
    const { tipid, userid, itemid } = req.params;
    Tip.findByIdAndRemove(tipid, function(err, tip) {
        if (err) {
            req.flag('error', 'There was an issue deleting item.');
            res.redirect('/dashboard');
        }
        res.json(tip);
    });
    Item.update({ _id: itemid }, { $pull: { tipIdArray: tipid } });
    User.update({ _id: userid }, { $pull: { tipIdArray: tipid } })
});

// PUT to remove bookmark item from User collections
router.put('/:itemid/deletebookmark', (req, res) => {
    const { itemid } = req.params;
    const userid = req.user._id;
    User.update({ _id: userid }, { $pull: { itemIdArray: itemid } }, function(err, user) {
        if (err) {
            req.flag('error', 'There was an issue deleting item.');
            res.redirect('/dashboard');
        }
        res.json(user);
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.render('home', { layout: "main" });
    }
}

module.exports = router;