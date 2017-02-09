const mongoose = require('mongoose');


const forumSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String
  },
  subject: {
    type: String
  }, 
  userName: {
    type: String
  }
});

const Forum = module.exports = mongoose.model('Forum', forumSchema);
