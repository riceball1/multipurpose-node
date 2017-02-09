/** TIP MODEL **/
const mongoose = require('mongoose');

const tipSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvote: {
    type: Number,
    default: 0
  },
  downvote: {
    type: Number,
    default: 0
  },
  content: {
    type: String
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  userName: {
    type: String
  }
});

// Instance method -> upvote()
// Modifies info for that instance only.
// tip3.upvote()  <- call it on a tip object.
// Like: tip3.save()

// Static will apply to the collection
// call it on the main obect Tip.findOrCreate()
// Like: Tip.find()

// Virtuals
// Extra property on an object. Not method(no calling)! on an instance.
// tip.finalScore -> return upvotes+downvotes.
// Like tip.content


const Tip = module.exports = mongoose.model('Tip', tipSchema);
