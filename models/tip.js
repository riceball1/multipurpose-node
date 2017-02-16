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
    type: String,
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  userName: {
    type: String
  }
});


const Tip = module.exports = mongoose.model('Tip', tipSchema);
