/* ITEMS MODEL */

const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
  itemName: {
    type: String
  },
  imgSrc: {
    type: String
  },
  shortDescription: {
    type: String
  },
  tipIdArray: {
    type: Array
  }
});




module.exports = mongoose.model('Item', itemSchema);
