/** TIP MODEL **/

const mongoose = require('mongoose');


const tipSchema = mongoose.Schema({
  userID: {
    type: String
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
  itemID: {
    type: String
  }
});

const Tip = module.exports = mongoose.model('Tip', tipSchema);

module.exports.getTipById = function(id, callback){
	Tip.findById(id, callback);
}

module.exports.getTipByUser = function(userid, callback) {
  let query = {userId: userid};
  Tip.find({query}, callback);
}
