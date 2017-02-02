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
  }
});

const Tip = module.exports = mongoose.model('Tip', tipSchema);

module.exports.getTipByUser = function(userid, callback) {
  let query = {userId: userid};
  Tip.find({query}, callback);
}
