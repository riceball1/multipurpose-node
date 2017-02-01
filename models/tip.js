/** TIP MODEL **/

const mongoose = require('mongoose');


const tipSchema = mongoose.Schema({
  userID: {
    type: String
  },
  rating: {
    type: Number
  },
  content: {
    type: String
  },
  itemID: {
    type: String
  }
});






module.exports = mongoose.model('Tip', tipSchema);
