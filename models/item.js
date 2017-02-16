/* ITEMS MODEL */

const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
  itemName: {
    type: String,
    lowercase: true,
    required: true
  },
  imgSrc: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  tipIdArray: [mongoose.Schema.Types.ObjectId]
});


var Item = module.exports = mongoose.model('Item', itemSchema);


/* export functions */
